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

/* ── 3D Mathematical Shape Generators ──────────────────────────
   Instead of sampling flat 2D canvas silhouettes, we generate
   fully volumetric 3D structures with mathematical equations.
   This gives the shapes real depth, structure, and fidelity
   matching the reference screenshots. */

/** Brain: 3D bilateral hemispheres with wavy gyri folds and a stem */
function buildBrain(n: number): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const r = 1.15

  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0
    let isRim = false

    // 12% of points form the brain stem at the bottom
    if (i < n * 0.12) {
      const h = rand(0, 0.7)
      const stemR = 0.15 * (1.0 - h * 0.3)
      const theta = Math.random() * PI2
      x = Math.cos(theta) * stemR
      y = -0.5 - h
      z = Math.sin(theta) * stemR
    } else {
      // 88% form the hemispheres
      const hemisphere = Math.random() > 0.5 ? 1 : -1
      const theta = Math.random() * Math.PI
      const phi = Math.random() * PI2

      // Base ellipsoid shape (elongated front-to-back, wider at back)
      const baseR = r * (0.85 + 0.15 * Math.sin(theta))
      const ex = baseR * Math.sin(theta) * Math.cos(phi) * 0.76 + hemisphere * 0.08
      const ey = baseR * Math.cos(theta) * 0.8
      const ez = baseR * Math.sin(theta) * Math.sin(phi) * 1.1

      // Surface folding frequency and amplitude
      const gX = Math.sin(ex * 12) * Math.cos(ey * 12) * Math.sin(ez * 12)
      const gY = Math.cos(ex * 8) * Math.sin(ey * 10) * Math.cos(ez * 8)
      const fold = (gX + gY) * 0.075

      // Push points toward the surface to define the shell (rim)
      const pct = Math.pow(Math.random(), 0.35)
      x = ex + ex * fold * pct
      y = ey + ey * fold * pct
      z = ez + ez * fold * pct

      if (pct > 0.72) isRim = true
    }

    pos[i * 3] = x
    pos[i * 3 + 1] = y + 0.15 // Center offset
    pos[i * 3 + 2] = z

    // Core is white/silver, outer rim glows gold/orange
    const rgb = pickColor(isRim, false, 0)
    col[i * 3] = rgb[0]
    col[i * 3 + 1] = rgb[1]
    col[i * 3 + 2] = rgb[2]
  }

  return { pos, col }
}

/** Lightbulb: 3D glass bulb, filament loop, support wires, and screw base */
function buildLightbulb(n: number): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const r = 1.1

  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0
    let isRim = false
    let vNorm = 0.5

    const randVal = Math.random()

    if (randVal < 0.60) {
      // 60% Glass envelope (spherical top tapering to neck)
      const theta = Math.random() * Math.PI
      const phi = Math.random() * PI2
      
      const bulbY = Math.cos(theta) * r
      const bulbRad = bulbY > 0 
        ? r * Math.sin(theta) * 0.95
        : r * Math.sin(theta) * 0.95 * (1.0 + bulbY * 0.45) // taper down
      
      const shellPct = Math.pow(Math.random(), 0.25) // push to shell
      x = Math.cos(phi) * bulbRad * shellPct
      y = bulbY + 0.25
      z = Math.sin(phi) * bulbRad * shellPct

      vNorm = (y + 1.0) / 2.2
      if (shellPct > 0.78) isRim = true
    } 
    else if (randVal < 0.82) {
      // 22% Screw threads base
      const h = rand(0, 0.55)
      const baseR = 0.38 - h * 0.08
      const phi = Math.random() * PI2
      
      // Thread helix displacement
      const thread = 0.026 * Math.sin(phi * 5 + h * 55)
      x = Math.cos(phi) * (baseR + thread)
      y = -r * 0.65 - h + 0.25
      z = Math.sin(phi) * (baseR + thread)

      vNorm = (y + 1.0) / 2.2
      isRim = true
    } 
    else if (randVal < 0.94) {
      // 12% Glowing filament and support loops inside
      const filamentType = Math.random()
      if (filamentType < 0.65) {
        // Coiled loop at the top
        const tVal = rand(0, PI2)
        const loopR = 0.28
        x = Math.cos(tVal) * loopR
        y = 0.45 + Math.sin(tVal * 12) * 0.028
        z = Math.sin(tVal) * loopR
      } else {
        // Internal support wires
        const wireSide = Math.random() > 0.5 ? 1 : -1
        const h = rand(0, 0.75)
        x = wireSide * 0.12 * (1.0 - h * 0.2)
        y = -0.3 + h
        z = 0
      }
      vNorm = (y + 1.0) / 2.2
      isRim = Math.random() > 0.2 // filament glows brightly
    } 
    else {
      // 6% Contact contact plate at the very bottom
      const h = rand(0, 0.12)
      const capR = 0.22 * (1.0 - h / 0.12)
      const phi = Math.random() * PI2
      x = Math.cos(phi) * capR
      y = -r * 1.2 + 0.25 - h
      z = Math.sin(phi) * capR
      vNorm = 0.05
    }

    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z

    const rgb = pickColor(isRim, true, vNorm)
    col[i * 3] = rgb[0]
    col[i * 3 + 1] = rgb[1]
    col[i * 3 + 2] = rgb[2]
  }

  return { pos, col }
}

/** Globe/Orb: 3D spherical grid lines (meridians & parallels) with a glowing core */
function buildOrb(n: number): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const r = 1.05

  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0
    let isRim = false
    const randVal = Math.random()

    if (randVal < 0.42) {
      // 42% Longitude lines (meridians wrapping the sphere)
      const numMeridians = 8
      const meridianIdx = Math.floor(Math.random() * numMeridians)
      const phi = (meridianIdx * Math.PI) / (numMeridians / 2)
      
      const theta = Math.random() * Math.PI
      x = r * Math.sin(theta) * Math.cos(phi)
      y = r * Math.cos(theta)
      z = r * Math.sin(theta) * Math.sin(phi)
      
      isRim = true
    } 
    else if (randVal < 0.74) {
      // 32% Latitude lines (parallels at constant heights)
      const numParallels = 6
      const parallelIdx = Math.floor(Math.random() * numParallels)
      const latVal = -0.7 + (parallelIdx * 1.4) / (numParallels - 1)
      const latY = latVal * r
      
      const parallelR = Math.sqrt(r * r - latY * latY)
      const phi = Math.random() * PI2
      
      x = parallelR * Math.cos(phi)
      y = latY
      z = parallelR * Math.sin(phi)
      
      isRim = true
    } 
    else if (randVal < 0.88) {
      // 14% Random points on the outer shell
      const theta = Math.random() * Math.PI
      const phi = Math.random() * PI2
      x = r * Math.sin(theta) * Math.cos(phi)
      y = r * Math.cos(theta)
      z = r * Math.sin(theta) * Math.sin(phi)
      
      isRim = Math.random() > 0.4
    } 
    else {
      // 12% Glowing center core (dense mini orb)
      const theta = Math.random() * Math.PI
      const phi = Math.random() * PI2
      const coreR = Math.random() * 0.22
      x = coreR * Math.sin(theta) * Math.cos(phi)
      y = coreR * Math.cos(theta)
      z = coreR * Math.sin(theta) * Math.sin(phi)
    }

    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z

    const rgb = pickColor(isRim, false, 0)
    col[i * 3] = rgb[0]
    col[i * 3 + 1] = rgb[1]
    col[i * 3 + 2] = rgb[2]
  }

  return { pos, col }
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
