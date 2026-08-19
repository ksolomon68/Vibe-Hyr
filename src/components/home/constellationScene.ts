'use client'

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import type { RefObject, MutableRefObject } from 'react'
import { useEffect } from 'react'

/* ──────────────────────────────────────────────────────────────
   NEURAL CONSTELLATION — real WebGL point cloud, not a 2D canvas
   approximation. A 2D canvas can only ever fake the reference's
   volumetric glow; additive-blended GPU point sprites plus a real
   bloom pass are what actually produce it. Three organic 3D forms
   (brain, lightbulb, orb) built from noise-displaced sphere/teardrop
   point samples, morphed by index-correspondence as the user scrolls,
   coloured gold at the outer "rim" (high noise displacement) and
   white/silver at the "core", with a scatter of violet/teal/magenta
   accents — plus a static ambient field of the same triangle sprites
   drifting slowly outside the main shape.
   ────────────────────────────────────────────────────────────── */

export type Shape = 'brain' | 'lightbulb' | 'orb'

const RIM_COLORS = ['#E8621A', '#E8621A', '#E8621A', '#E8621A', '#E8621A', '#F0B429', '#F0B429', '#F0B429', '#FFFFFF']
const RIM_LOWER_COLORS = ['#E8621A', '#E8621A', '#F0B429', '#8B5CF6', '#8B5CF6', '#F97316', '#FB923C', '#E8621A', '#FFB86B']
const CORE_COLORS = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#F0B429', '#8B5CF6', '#F97316']
const AMBIENT_COLORS = ['#FFFFFF', '#FFFFFF', '#F0B429', '#F0B429', '#E8621A', '#8B5CF6', '#F97316', '#FB923C', '#FFB86B']

const pick = (pool: string[]) => pool[(Math.random() * pool.length) | 0]
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (t: number) => t * t * (3 - 2 * t)

const colorCache = new Map<string, [number, number, number]>()
function hex01(hex: string): [number, number, number] {
  const cached = colorCache.get(hex)
  if (cached) return cached
  const c = new THREE.Color(hex)
  const rgb: [number, number, number] = [c.r, c.g, c.b]
  colorCache.set(hex, rgb)
  return rgb
}

/** Rim glows gold/orange, core stays white/silver. Only the lightbulb
    carries Dala's tip gradient (gold shoulders fading into violet/teal/
    blue at the bottom), ramped smoothly by vertical position. */
function pickColor(rim: boolean, spectrumTip: boolean, vNorm: number): [number, number, number] {
  if (rim) {
    if (spectrumTip && Math.random() < clamp01((vNorm - 0.45) / 0.4)) return hex01(pick(RIM_LOWER_COLORS))
    return hex01(pick(RIM_COLORS))
  }
  return hex01(pick(CORE_COLORS))
}

type Cloud = { pos: Float32Array; col: Float32Array }

/* ── Icon-silhouette-based volume ──────────────────────────────
   Pure noise-displaced spheres only ever read as "blob on a stick" —
   nothing in that method encodes what makes a brain a brain or a
   bulb a bulb. Instead, sample real icon silhouettes (Lucide's Brain/
   Lightbulb/Globe glyphs, the same geometry that read correctly in
   the earlier 2D build) for x/y and recognisable internal texture,
   then give each sampled point a "puffy" z-depth derived from a
   blurred version of the plain silhouette — a poor man's distance
   field, the same trick behind inflated/emoji-style icon renders.
   That gets real 3D volume for the bloom to light without losing the
   silhouette that actually makes the shape identifiable. */

const ICON_SIZE = 256

function offscreenIcon(): CanvasRenderingContext2D {
  const c = document.createElement('canvas')
  c.width = ICON_SIZE
  c.height = ICON_SIZE
  return c.getContext('2d', { willReadFrequently: true })!
}

/** Sets up an icon-space (24×24) transform on a fresh ICON_SIZE canvas. */
function iconCtx(scale: number, cx: number, cy: number): CanvasRenderingContext2D {
  const c = offscreenIcon()
  c.translate(ICON_SIZE / 2 - cx * scale, ICON_SIZE / 2 - cy * scale)
  c.scale(scale, scale)
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.strokeStyle = '#fff'
  c.fillStyle = '#fff'
  return c
}

type IconMasks = { detail: Uint8ClampedArray; puff: Uint8ClampedArray }

function buildIconMasks(drawSilhouette: () => CanvasRenderingContext2D, drawDetail: () => CanvasRenderingContext2D): IconMasks {
  const silhouette = drawSilhouette()
  const blurred = offscreenIcon()
  blurred.filter = 'blur(20px)'
  blurred.drawImage(silhouette.canvas, 0, 0)
  const puff = blurred.getImageData(0, 0, ICON_SIZE, ICON_SIZE).data

  const detailCtx = drawDetail()
  const detail = detailCtx.getImageData(0, 0, ICON_SIZE, ICON_SIZE).data

  return { detail, puff }
}

type IconPoint = { u: number; v: number; z: number; rim: boolean }

function sampleIcon(masks: IconMasks, n: number): IconPoint[] {
  const pts: IconPoint[] = []
  const maxAttempts = n * 300
  let attempts = 0
  while (pts.length < n && attempts < maxAttempts) {
    attempts++
    const mx = (Math.random() * ICON_SIZE) | 0
    const my = (Math.random() * ICON_SIZE) | 0
    const idx = (my * ICON_SIZE + mx) * 4 + 3
    const a = masks.detail[idx] / 255
    if (a < 0.04 || Math.random() > a) continue
    pts.push({ u: mx / ICON_SIZE, v: my / ICON_SIZE, z: masks.puff[idx] / 255, rim: a > 0.85 })
  }
  while (pts.length < n) pts.push({ u: Math.random(), v: Math.random(), z: 0, rim: false })
  return pts
}

/** Converts sampled icon points into a world-space point cloud: x/y
    from silhouette position, z scattered through the puffy volume
    thickness at that point (thin near edges, thick through the
    middle) so the shape reads as an inflated solid, not a flat card. */
function iconToCloud(pts: IconPoint[], worldSize: number, maxDepth: number, spectrumTip: boolean): Cloud {
  const n = pts.length
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const x = (p.u - 0.5) * worldSize
    const y = (0.5 - p.v) * worldSize
    const z = (Math.random() * 2 - 1) * Math.pow(p.z, 0.55) * maxDepth
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
    const rgb = pickColor(p.rim, spectrumTip, p.v)
    col[i * 3] = rgb[0]
    col[i * 3 + 1] = rgb[1]
    col[i * 3 + 2] = rgb[2]
  }
  return { pos, col }
}

/* Hand-drawn silhouettes, not icon glyphs. Lucide's Brain/Lightbulb
   marks are designed to read at 24px next to text — their notch and
   neck are subtle, single-pixel-scale details that a point-cloud +
   bloom render smooths straight into a plain ball. These paths are
   drawn at cartoon-icon exaggeration instead: a wide, unmistakably
   two-lobed dome cut by a deep central notch, on a long, clearly
   separate stem/neck — verified to actually read as a silhouette in
   isolation before being wired into the particle pipeline. */

function iconCtxRaw(scale: number, tx: number, ty: number): CanvasRenderingContext2D {
  const c = offscreenIcon()
  c.translate(ICON_SIZE / 2 + tx * scale, ICON_SIZE / 2 + ty * scale)
  c.scale(scale, scale)
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.strokeStyle = '#fff'
  c.fillStyle = '#fff'
  return c
}

const BRAIN_SCALE = 0.58

function traceBrainDome(c: CanvasRenderingContext2D) {
  c.beginPath()
  c.moveTo(-74, 36)
  c.bezierCurveTo(-84, -16, -60, -60, -26, -54)
  c.bezierCurveTo(-16, -64, 16, -64, 26, -54)
  c.bezierCurveTo(60, -60, 84, -16, 74, 36)
  c.bezierCurveTo(70, 60, 44, 72, 0, 72)
  c.bezierCurveTo(-44, 72, -70, 60, -74, 36)
  c.closePath()
}
function traceBrainStem(c: CanvasRenderingContext2D) {
  c.beginPath()
  c.moveTo(-17, 64)
  c.bezierCurveTo(-15, 98, -8, 124, 0, 140)
  c.bezierCurveTo(8, 124, 15, 98, 17, 64)
  c.closePath()
}
function traceBrainNotch(c: CanvasRenderingContext2D) {
  c.beginPath()
  c.moveTo(-24, -60)
  c.bezierCurveTo(-27, -32, -20, -6, 0, 10)
  c.bezierCurveTo(20, -6, 27, -32, 24, -60)
  c.bezierCurveTo(13, -72, -13, -72, -24, -60)
  c.closePath()
}

function buildBrainMasks(): IconMasks {
  return buildIconMasks(
    () => {
      const c = iconCtxRaw(BRAIN_SCALE, 0, -6)
      traceBrainDome(c)
      c.fill()
      traceBrainStem(c)
      c.fill()
      c.globalCompositeOperation = 'destination-out'
      traceBrainNotch(c)
      c.fill()
      c.globalCompositeOperation = 'source-over'
      return c
    },
    () => {
      const c = iconCtxRaw(BRAIN_SCALE, 0, -6)
      c.globalAlpha = 0.25
      traceBrainDome(c)
      c.fill()
      c.globalAlpha = 0.16
      traceBrainStem(c)
      c.fill()
      c.globalCompositeOperation = 'destination-out'
      c.globalAlpha = 1
      traceBrainNotch(c)
      c.fill()
      c.globalCompositeOperation = 'source-over'

      c.globalAlpha = 1
      c.lineWidth = 4
      traceBrainDome(c)
      c.stroke()
      traceBrainStem(c)
      c.stroke()

      c.globalAlpha = 0.5
      for (const s of [0.88, 0.74, 0.6, 0.45]) {
        c.save()
        c.translate(0, 0)
        c.scale(s, s)
        c.lineWidth = 3 / s
        traceBrainDome(c)
        c.stroke()
        c.restore()
      }
      return c
    },
  )
}

const BULB_SCALE = 0.58

function traceBulbGlass(c: CanvasRenderingContext2D) {
  c.beginPath()
  c.moveTo(-20, 46)
  c.bezierCurveTo(-60, 40, -78, -6, -60, -46)
  c.bezierCurveTo(-42, -80, 42, -80, 60, -46)
  c.bezierCurveTo(78, -6, 60, 40, 20, 46)
  c.bezierCurveTo(24, 54, 24, 58, 20, 60)
  c.lineTo(-20, 60)
  c.bezierCurveTo(-24, 58, -24, 54, -20, 46)
  c.closePath()
}
function traceBulbNeck(c: CanvasRenderingContext2D) {
  c.beginPath()
  c.moveTo(-18, 60)
  c.bezierCurveTo(-18, 70, -16, 78, -12, 96)
  c.bezierCurveTo(-10, 108, -8, 112, 0, 116)
  c.bezierCurveTo(8, 112, 10, 108, 12, 96)
  c.bezierCurveTo(16, 78, 18, 70, 18, 60)
  c.closePath()
}
const BULB_THREADS = [70, 80, 90, 100]

function buildLightbulbMasks(): IconMasks {
  return buildIconMasks(
    () => {
      const c = iconCtxRaw(BULB_SCALE, 0, -30)
      traceBulbGlass(c)
      c.fill()
      traceBulbNeck(c)
      c.fill()
      c.globalCompositeOperation = 'destination-out'
      for (const y of BULB_THREADS) {
        c.beginPath()
        c.ellipse(0, y, 15, 2.5, 0, 0, Math.PI * 2)
        c.fill()
      }
      c.globalCompositeOperation = 'source-over'
      return c
    },
    () => {
      const c = iconCtxRaw(BULB_SCALE, 0, -30)
      c.globalAlpha = 0.25
      traceBulbGlass(c)
      c.fill()
      c.globalAlpha = 0.2
      traceBulbNeck(c)
      c.fill()
      c.globalCompositeOperation = 'destination-out'
      c.globalAlpha = 1
      for (const y of BULB_THREADS) {
        c.beginPath()
        c.ellipse(0, y, 15, 2.5, 0, 0, Math.PI * 2)
        c.fill()
      }
      c.globalCompositeOperation = 'source-over'

      c.globalAlpha = 1
      c.lineWidth = 4
      traceBulbGlass(c)
      c.stroke()
      traceBulbNeck(c)
      c.stroke()

      c.globalAlpha = 0.5
      for (const s of [0.88, 0.74, 0.6, 0.45]) {
        c.save()
        c.scale(s, s)
        c.lineWidth = 3 / s
        traceBulbGlass(c)
        c.stroke()
        c.restore()
      }
      return c
    },
  )
}

function buildOrbMasks(): IconMasks {
  const disc = new Path2D()
  disc.arc(12, 12, 10, 0, Math.PI * 2)
  const meridian = new Path2D('M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20')
  const equator = new Path2D('M2 12h20')

  return buildIconMasks(
    () => {
      const c = iconCtx(9.8, 12, 12)
      c.fill(disc)
      return c
    },
    () => {
      const c = iconCtx(9.8, 12, 12)
      c.globalAlpha = 0.25
      c.fill(disc)
      c.globalAlpha = 1
      c.lineWidth = 0.65
      c.stroke(disc)
      c.globalAlpha = 0.5
      for (const s of [0.86, 0.7, 0.54, 0.38]) {
        c.save()
        c.translate(12, 12)
        c.scale(s, s)
        c.translate(-12, -12)
        c.lineWidth = 0.42 / s
        c.stroke(disc)
        c.restore()
      }
      c.globalAlpha = 1
      c.lineWidth = 0.5
      c.stroke(meridian)
      c.stroke(equator)
      return c
    },
  )
}

function buildBrain(n: number): Cloud {
  return iconToCloud(sampleIcon(buildBrainMasks(), n), 2.7, 0.2, false)
}
function buildLightbulb(n: number): Cloud {
  return iconToCloud(sampleIcon(buildLightbulbMasks(), n), 2.7, 0.22, true)
}
function buildOrb(n: number): Cloud {
  return iconToCloud(sampleIcon(buildOrbMasks(), n), 2.4, 0.35, false)
}

/** Small soft-edged outlined (hollow) triangle — the exact style from
    the reference site: visible stroked edge, transparent fill. */
function makeTriangleSprite(): THREE.CanvasTexture {
  const size = 96
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, size, size)

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38

  ctx.beginPath()
  for (let k = 0; k < 3; k++) {
    const a = -Math.PI / 2 + (k * Math.PI * 2) / 3
    const px = cx + Math.cos(a) * r
    const py = cy + Math.sin(a) * r
    if (k === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()

  // Very subtle fill (near transparent) so the triangle reads in additive blending
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fill()

  // Sharp white outline
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3.5
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 2
  ctx.stroke()

  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

const KEYFRAMES: { t: number; shape: Shape }[] = [
  { t: 0.0, shape: 'brain' },
  { t: 0.24, shape: 'brain' },
  { t: 0.42, shape: 'lightbulb' },
  { t: 0.64, shape: 'lightbulb' },
  { t: 0.82, shape: 'orb' },
  { t: 1.0, shape: 'orb' },
]

function currentShapes(t: number) {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i]
    const b = KEYFRAMES[i + 1]
    if (t >= a.t && t <= b.t) {
      const localT = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t)
      return { shapeA: a.shape, shapeB: b.shape, localT: clamp01(localT) }
    }
  }
  return { shapeA: 'orb' as Shape, shapeB: 'orb' as Shape, localT: 0 }
}

/* Target screen position for each shape, as a fraction of viewport
   width/height (0.5,0.5 = dead centre) — converted to world units each
   frame from the camera's frustum at the cloud's depth. Desktop
   alternates right/left so the shape never sits under its own copy. */
const SCREEN_DESKTOP: Record<Shape, { x: number; y: number; scale: number }> = {
  brain: { x: 0.71, y: 0.52, scale: 1 },
  lightbulb: { x: 0.26, y: 0.5, scale: 0.95 },
  orb: { x: 0.24, y: 0.55, scale: 0.85 },
}
const SCREEN_MOBILE: Record<Shape, { x: number; y: number; scale: number }> = {
  brain: { x: 0.5, y: 0.32, scale: 0.62 },
  lightbulb: { x: 0.5, y: 0.3, scale: 0.6 },
  orb: { x: 0.5, y: 0.32, scale: 0.52 },
}

export function useConstellationScene(canvasRef: RefObject<HTMLCanvasElement>, progressRef: MutableRefObject<number>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const structuredCount = window.innerWidth < 768 ? 2000 : window.innerWidth < 1280 ? 3600 : 5000
    const ambientCount = window.innerWidth < 768 ? 90 : 200

    const brainCloud = buildBrain(structuredCount)
    const bulbCloud = buildLightbulb(structuredCount)
    const orbCloud = buildOrb(structuredCount)
    const clouds: Record<Shape, Cloud> = { brain: brainCloud, lightbulb: bulbCloud, orb: orbCloud }

    const ambientPos = new Float32Array(ambientCount * 3)
    const ambientCol = new Float32Array(ambientCount * 3)
    const ambientPhase = new Float32Array(ambientCount)
    for (let i = 0; i < ambientCount; i++) {
      ambientPos[i * 3] = (Math.random() * 2 - 1) * 4.2
      ambientPos[i * 3 + 1] = (Math.random() * 2 - 1) * 2.6
      ambientPos[i * 3 + 2] = (Math.random() * 2 - 1) * 2.4
      const rgb = hex01(pick(AMBIENT_COLORS))
      ambientCol.set(rgb, i * 3)
      ambientPhase[i] = Math.random() * Math.PI * 2
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setClearColor(0x000000, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50)
    camera.position.set(0, 0, 6)

    const sprite = makeTriangleSprite()

    const structuredGeom = new THREE.BufferGeometry()
    const livePos = new Float32Array(structuredCount * 3)
    const liveCol = new Float32Array(structuredCount * 3)
    structuredGeom.setAttribute('position', new THREE.BufferAttribute(livePos, 3))
    structuredGeom.setAttribute('color', new THREE.BufferAttribute(liveCol, 3))
    const structuredMat = new THREE.PointsMaterial({
      size: 0.03,
      map: sprite,
      transparent: true,
      opacity: 1,
      alphaTest: 0.02,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    })
    const structuredPoints = new THREE.Points(structuredGeom, structuredMat)
    scene.add(structuredPoints)

    const ambientGeom = new THREE.BufferGeometry()
    ambientGeom.setAttribute('position', new THREE.BufferAttribute(ambientPos.slice(), 3))
    ambientGeom.setAttribute('color', new THREE.BufferAttribute(ambientCol, 3))
    const ambientMat = new THREE.PointsMaterial({
      size: 0.045,
      map: sprite,
      transparent: true,
      opacity: 0.3,
      alphaTest: 0.02,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    })
    const ambientPoints = new THREE.Points(ambientGeom, ambientMat)
    scene.add(ambientPoints)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.75, 0.28, 0.32)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    let vw = 0
    let vh = 0
    let isMobile = window.innerWidth < 1024
    let raf = 0
    const pointer = { x: 0, y: 0 }

    function worldOffset(fx: number, fy: number, depth: number) {
      const halfH = depth * Math.tan((camera.fov * Math.PI) / 360)
      const halfW = halfH * camera.aspect
      return { x: (fx - 0.5) * 2 * halfW, y: (0.5 - fy) * 2 * halfH }
    }

    function resize() {
      vw = window.innerWidth
      vh = window.innerHeight
      isMobile = vw < 1024
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(vw, vh, false)
      composer.setSize(vw, vh)
      bloom.setSize(vw, vh)
      camera.aspect = vw / vh
      camera.updateProjectionMatrix()
    }

    function onPointerMove(e: PointerEvent) {
      pointer.x = (e.clientX / vw - 0.5) * 2
      pointer.y = (e.clientY / vh - 0.5) * 2
    }

    function render(time: number) {
      const progress = progressRef.current
      const { shapeA, shapeB, localT } = currentShapes(progress)
      const eased = smoothstep(localT)
      const morphing = shapeA !== shapeB
      const cloudA = clouds[shapeA]
      const cloudB = clouds[shapeB]
      const colorShape = eased < 0.5 ? shapeA : shapeB
      const colorCloud = clouds[colorShape]
      const screens = isMobile ? SCREEN_MOBILE : SCREEN_DESKTOP
      const sa = screens[shapeA]
      const sb = screens[shapeB]
      const depth = camera.position.z
      const offA = worldOffset(sa.x, sa.y, depth)
      const offB = worldOffset(sb.x, sb.y, depth)
      const groupX = lerp(offA.x, offB.x, eased)
      const groupY = lerp(offA.y, offB.y, eased)
      const groupScale = lerp(sa.scale, sb.scale, eased)

      const burst = morphing ? Math.sin(Math.PI * eased) * 0.85 : 0
      const t = reduceMotion ? 0 : time * 0.001

      for (let i = 0; i < structuredCount; i++) {
        const i3 = i * 3
        const ax = cloudA.pos[i3]
        const ay = cloudA.pos[i3 + 1]
        const az = cloudA.pos[i3 + 2]
        const bx = cloudB.pos[i3]
        const by = cloudB.pos[i3 + 1]
        const bz = cloudB.pos[i3 + 2]
        let x = lerp(ax, bx, eased)
        let y = lerp(ay, by, eased)
        let z = lerp(az, bz, eased)

        if (burst > 0) {
          const len = Math.hypot(x, y, z) || 1
          x += (x / len) * burst
          y += (y / len) * burst
          z += (z / len) * burst
        }

        if (!reduceMotion) {
          const phase = i * 12.9898
          x += Math.sin(t * 0.5 + phase) * 0.012
          y += Math.cos(t * 0.42 + phase) * 0.012
        }

        livePos[i3] = x
        livePos[i3 + 1] = y
        livePos[i3 + 2] = z
        liveCol[i3] = colorCloud.col[i3]
        liveCol[i3 + 1] = colorCloud.col[i3 + 1]
        liveCol[i3 + 2] = colorCloud.col[i3 + 2]
      }
      structuredGeom.attributes.position.needsUpdate = true
      structuredGeom.attributes.color.needsUpdate = true

      structuredPoints.position.set(groupX, groupY, 0)
      structuredPoints.scale.setScalar(groupScale)

      if (!reduceMotion) {
        structuredPoints.rotation.y = Math.sin(t * 0.06) * 0.22 + pointer.x * 0.18
        structuredPoints.rotation.x = pointer.y * 0.1

        const ambientArr = ambientGeom.attributes.position.array as Float32Array
        for (let i = 0; i < ambientCount; i++) {
          const i3 = i * 3
          const drift = t * 0.08 + ambientPhase[i]
          ambientArr[i3] = ambientPos[i3] + Math.sin(drift) * 0.15
          ambientArr[i3 + 1] = ambientPos[i3 + 1] + Math.cos(drift * 0.8) * 0.15
        }
        ambientGeom.attributes.position.needsUpdate = true
      }

      composer.render()
    }

    function frame(time: number) {
      render(time)
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduceMotion) {
      render(0)
      const onScroll = () => render(0)
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        window.removeEventListener('resize', resize)
        window.removeEventListener('scroll', onScroll)
        composer.dispose()
        renderer.dispose()
        structuredGeom.dispose()
        structuredMat.dispose()
        ambientGeom.dispose()
        ambientMat.dispose()
        sprite.dispose()
      }
    }

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      composer.dispose()
      renderer.dispose()
      structuredGeom.dispose()
      structuredMat.dispose()
      ambientGeom.dispose()
      ambientMat.dispose()
      sprite.dispose()
    }
  }, [canvasRef, progressRef])
}
