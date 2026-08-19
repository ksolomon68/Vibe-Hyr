'use client'

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { createNoise3D } from 'simplex-noise'
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
const RIM_LOWER_COLORS = ['#E8621A', '#E8621A', '#F0B429', '#8B5CF6', '#8B5CF6', '#14B8A6', '#14B8A6', '#3B82F6', '#EC4899']
const CORE_COLORS = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#F0B429', '#8B5CF6', '#14B8A6']
const AMBIENT_COLORS = ['#FFFFFF', '#FFFFFF', '#F0B429', '#F0B429', '#E8621A', '#8B5CF6', '#14B8A6', '#3B82F6', '#EC4899']

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

type NoiseFn = (x: number, y: number, z: number) => number

function fbm3(noise: NoiseFn, x: number, y: number, z: number, octaves = 4, lacunarity = 2.1, gain = 0.55): number {
  let amp = 1
  let freq = 1
  let sum = 0
  let norm = 0
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x * freq, y * freq, z * freq)
    norm += amp
    amp *= gain
    freq *= lacunarity
  }
  return norm > 0 ? sum / norm : 0
}

/** Uniform-on-sphere direction via Marsaglia's method. */
function sphereDir(): [number, number, number] {
  let u: number, v: number, w: number, s: number
  do {
    u = Math.random() * 2 - 1
    v = Math.random() * 2 - 1
    w = Math.random() * 2 - 1
    s = u * u + v * v + w * w
  } while (s > 1 || s === 0)
  const inv = 1 / Math.sqrt(s)
  return [u * inv, v * inv, w * inv]
}

type Cloud = { pos: Float32Array; col: Float32Array }

function buildBrain(n: number, noise: NoiseFn): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const domeCount = Math.floor(n * 0.88)
  const R = 1.35

  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number, bump: number

    if (i < domeCount) {
      let [dx, dy, dz] = sphereDir()
      if (dy < -0.25) dy = -0.25 - (-0.25 - dy) * 0.4 // flatten the underside toward the stem
      bump = fbm3(noise, dx * 2.2, dy * 2.2, dz * 2.2)
      const fissure = Math.exp(-(dx * dx) / 0.09) * 0.34 // central longitudinal groove
      const r = R * (1 + bump * 0.17) - fissure
      x = dx * r
      y = dy * r * 0.92 + 0.16
      z = dz * r * 0.86
    } else {
      const t = (i - domeCount) / Math.max(1, n - domeCount)
      const stemR = 0.36 * (1 - t * 0.5)
      const ang = Math.random() * Math.PI * 2
      const rad = Math.sqrt(Math.random()) * stemR
      x = Math.cos(ang) * rad
      z = Math.sin(ang) * rad
      y = -0.14 - t * 0.95 // starts right where the flattened dome underside sits, no gap
      bump = fbm3(noise, x * 3, y * 3, z * 3, 3, 2, 0.5)
    }

    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
    const rgb = pickColor(bump > 0.13, false, 0)
    col[i * 3] = rgb[0]
    col[i * 3 + 1] = rgb[1]
    col[i * 3 + 2] = rgb[2]
  }
  return { pos, col }
}

function buildLightbulb(n: number, noise: NoiseFn): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const bulbCount = Math.floor(n * 0.76)
  const R = 1.15

  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number, bump: number, vNorm: number

    if (i < bulbCount) {
      let [dx, dy, dz] = sphereDir()
      if (dy < -0.1) dy = -0.1 - (-0.1 - dy) * 0.5
      bump = fbm3(noise, dx * 2, dy * 2, dz * 2)
      const r = R * (1 + bump * 0.13)
      x = dx * r
      y = dy * r * 1.05 + 0.6
      z = dz * r
      vNorm = clamp01((1.5 - y) / 2.4)
    } else {
      const t = (i - bulbCount) / Math.max(1, n - bulbCount)
      const neckR = 0.34 * (1 - t * 0.65)
      const ang = Math.random() * Math.PI * 2
      const rad = Math.sqrt(Math.random()) * neckR
      x = Math.cos(ang) * rad
      z = Math.sin(ang) * rad
      y = 0.47 - t * 1.75 // starts right where the flattened bulb underside sits, no gap
      bump = fbm3(noise, x * 3, y * 3, z * 3, 3, 2, 0.5)
      vNorm = clamp01(0.45 + t * 0.55)
    }

    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
    const rgb = pickColor(bump > 0.1, true, vNorm)
    col[i * 3] = rgb[0]
    col[i * 3 + 1] = rgb[1]
    col[i * 3 + 2] = rgb[2]
  }
  return { pos, col }
}

function buildOrb(n: number, noise: NoiseFn): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const R = 1.2

  for (let i = 0; i < n; i++) {
    const [dx, dy, dz] = sphereDir()
    const bump = fbm3(noise, dx * 2.4, dy * 2.4, dz * 2.4, 3, 2.2, 0.5)
    const r = R * (1 + bump * 0.07)
    pos[i * 3] = dx * r
    pos[i * 3 + 1] = dy * r
    pos[i * 3 + 2] = dz * r
    const rgb = pickColor(bump > 0.2, false, 0)
    col[i * 3] = rgb[0]
    col[i * 3 + 1] = rgb[1]
    col[i * 3 + 2] = rgb[2]
  }
  return { pos, col }
}

/** Small soft-edged filled triangle — the brand's particle motif,
    rendered as a canvas sprite so additive blending still glows where
    points overlap densely. */
function makeTriangleSprite(): THREE.CanvasTexture {
  const size = 64
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 9
  ctx.beginPath()
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  for (let k = 0; k < 3; k++) {
    const a = -Math.PI / 2 + (k * Math.PI * 2) / 3
    const px = cx + Math.cos(a) * r
    const py = cy + Math.sin(a) * r
    if (k === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
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
    const structuredCount = window.innerWidth < 768 ? 2200 : window.innerWidth < 1280 ? 4200 : 6000
    const ambientCount = window.innerWidth < 768 ? 90 : 200

    const noise = createNoise3D()
    const brainCloud = buildBrain(structuredCount, noise)
    const bulbCloud = buildLightbulb(structuredCount, noise)
    const orbCloud = buildOrb(structuredCount, noise)
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
      size: 0.06,
      map: sprite,
      transparent: true,
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
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.45, 0.32)
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
