'use client'

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import type { RefObject, MutableRefObject } from 'react'
import { useEffect } from 'react'

// Surface-sampled triangle clouds dissolve into a shared field before re-forming.
// Scroll progress drives geometry and copy together; time only adds idle drift.

export type Shape = 'brain' | 'scatter' | 'lightbulb' | 'orb'

const AMBIENT_COLORS = ['#DDE1E5', '#DDE1E5', '#B5BBC4', '#D8BD86']

const PI2 = Math.PI * 2
const pick = (pool: string[]) => pool[(Math.random() * pool.length) | 0]
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (t: number) => t * t * (3 - 2 * t)
const rand = (a: number, b: number) => a + Math.random() * (b - a)

const colorCache = new Map<string, [number, number, number]>()
function hex01(hex: string): [number, number, number] {
  const cached = colorCache.get(hex)
  if (cached) return cached
  const c = new THREE.Color(hex)
  const rgb: [number, number, number] = [c.r, c.g, c.b]
  colorCache.set(hex, rgb)
  return rgb
}

type Cloud = { pos: Float32Array; col: Float32Array }

/** Lighting follows the actual cortical normals and sulcal depth. */
function brainColor(nx: number, ny: number, nz: number, ridge: number) {
  const key = Math.max(0, -nx * 0.45 + ny * 0.65 + nz * 0.6)
  const rim = Math.pow(1 - Math.abs(nz), 3)
  return new THREE.Color('#DCE2EA')
    .lerp(new THREE.Color('#D8BD86'), ridge * 0.18 + rim * 0.12)
    .multiplyScalar((0.18 + key * 0.75 + rim * 0.14) * (0.22 + ridge * 0.78))
}

/** Sample an anatomical cortical surface; ridges and sulci come from the mesh. */
function buildBrain(n: number, surface: Float32Array, indices: Uint32Array): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const count = indices.length / 3
  for (let i = 0; i < n; i++) {
    const face = ((i * 7919) % count) * 3
    const a = indices[face] * 7, b = indices[face + 1] * 7, c = indices[face + 2] * 7
    // Low-discrepancy barycentric sampling preserves spacing while following every fold.
    const u = Math.sqrt(((i + 0.5) * 0.754877666) % 1)
    const v = ((i + 0.5) * 0.569840291) % 1
    const wa = 1 - u, wb = u * (1 - v), wc = u * v
    const sample = (axis: number) => surface[a + axis] * wa + surface[b + axis] * wb + surface[c + axis] * wc
    const x = sample(0), y = sample(1), z = sample(2)
    const nx = sample(3), ny = sample(4), nz = sample(5)
    const ridge = sample(6)
    pos.set([x, y, z], i * 3)
    const color = brainColor(nx, ny, nz, ridge).multiplyScalar(3.2)
    col.set([color.r, color.g, color.b], i * 3)
  }
  return { pos, col }
}

/** A smooth glass envelope, a warm coiled filament, and a threaded metal base. */
function buildLightbulb(n: number): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const dome = new THREE.CubicBezierCurve(
    new THREE.Vector2(0, 1.25), new THREE.Vector2(0.62, 1.25),
    new THREE.Vector2(0.9, 0.96), new THREE.Vector2(0.9, 0.48),
  )
  const neck = new THREE.CubicBezierCurve(
    new THREE.Vector2(0.9, 0.48), new THREE.Vector2(0.9, -0.08),
    new THREE.Vector2(0.27, -0.25), new THREE.Vector2(0.27, -0.73),
  )
  for (let i = 0; i < n; i++) {
    const part = i / n
    const phi = i * Math.PI * (3 - Math.sqrt(5))
    const t = ((i + 0.5) * 0.754877666) % 1
    let x: number, y: number, z: number
    const color = new THREE.Color('#DCE2EA')
    if (part < 0.68) {
      const profile = t < 0.48 ? dome.getPoint(t / 0.48) : neck.getPoint((t - 0.48) / 0.52)
      // Reserve a few points for the silhouette; let the glass stay transparent inside.
      const angle = part < 0.06 ? (i % 2) * Math.PI : phi
      x = Math.cos(angle) * profile.x
      y = profile.y
      z = Math.sin(angle) * profile.x
      const edge = Math.pow(Math.abs(Math.cos(angle)), 10)
      color.multiplyScalar(0.16 + edge * 1.8 + Math.max(0, Math.sin(angle)) * 0.16)
    } else if (part < 0.85) {
      y = -0.73 - t * 0.43
      const thread = Math.cos(t * PI2 * 5 - phi)
      const radius = 0.25 - t * 0.025 + thread * 0.025
      x = Math.cos(phi) * radius
      z = Math.sin(phi) * radius
      color.lerp(new THREE.Color('#D8BD86'), 0.32)
        .multiplyScalar((0.60 + 1.40 * Math.pow(thread * 0.5 + 0.5, 3)) * (0.35 + 0.65 * Math.max(0, Math.sin(phi))))
    } else if (part < 0.88) {
      y = -1.16 - t * 0.13
      const radius = 0.18 * Math.sqrt(1 - t)
      x = Math.cos(phi) * radius
      z = Math.sin(phi) * radius
      color.multiplyScalar(0.5)
    } else {
      const filament = (part - 0.88) / 0.12
      if (filament < 0.6) {
        const coil = filament / 0.6
        x = lerp(-0.27, 0.27, coil)
        y = 0.22 + Math.sin(coil * PI2 * 11) * 0.035
        z = Math.cos(coil * PI2 * 11) * 0.035
        color.set('#FFE2A3').multiplyScalar(2.1)
      } else {
        const stem = (filament - 0.6) / 0.4
        const side = i % 2 ? 1 : -1
        x = side * lerp(0.08, 0.27, stem)
        y = lerp(-0.73, 0.22, stem)
        z = 0
        color.set('#D8BD86').multiplyScalar(0.65)
      }
    }
    const tilt = 0.10
    pos.set([x * Math.cos(tilt) + y * Math.sin(tilt), y * Math.cos(tilt) - x * Math.sin(tilt), z], i * 3)
    col.set([color.r, color.g, color.b], i * 3)
  }
  return { pos, col }
}

/** A shaded sphere with actual latitude/longitude particles, not a moiré shell. */
function buildOrb(n: number): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const t = ((i + 0.5) * 0.754877666) % 1
    let latitude: number, longitude: number
    const grid = i >= n * 0.78
    if (!grid) {
      latitude = Math.asin(1 - 2 * (i + 0.5) / (n * 0.78))
      longitude = i * goldenAngle
    } else if (i < n * 0.89) {
      latitude = ((i % 7) - 3) * Math.PI / 9
      longitude = t * PI2
    } else {
      latitude = (t - 0.5) * Math.PI
      longitude = (i % 12) * PI2 / 12
    }
    const x = Math.cos(longitude) * Math.cos(latitude)
    const y = Math.sin(latitude)
    const z = Math.sin(longitude) * Math.cos(latitude)
    // Rotate the globe's grid so its curvature reads in three dimensions.
    pos.set([(x * 0.966 - y * 0.259) * 1.15, (x * 0.259 + y * 0.966) * 1.15, z * 1.15], i * 3)
    const front = smoothstep(clamp01(z * 4))
    const key = Math.max(0, -x * 0.4 + y * 0.55 + z * 0.7)
    const color = new THREE.Color(grid ? '#D8BD86' : '#DCE2EA')
      .multiplyScalar((0.08 + front * 0.92) * (0.2 + key * 0.65) * (grid ? 2.4 : 1.6))
    col.set([color.r, color.g, color.b], i * 3)
  }
  return { pos, col }
}

/** Crisp outlined triangles stay individually visible within the luminous surface. */
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
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fill()

  // Sharp white outline
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 4.5
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 0
  ctx.stroke()

  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

// Keep these holds aligned with the copy windows in HeroSection.
const KEYFRAMES: { t: number; shape: Shape }[] = [
  { t: 0, shape: 'brain' },
  { t: 0.16, shape: 'brain' },
  { t: 0.30, shape: 'scatter' },
  { t: 0.44, shape: 'scatter' },
  { t: 0.60, shape: 'lightbulb' },
  { t: 0.74, shape: 'lightbulb' },
  { t: 0.90, shape: 'orb' },
  { t: 1, shape: 'orb' },
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
  brain: { x: 0.72, y: 0.52, scale: 1.02 },
  scatter: { x: 0.5, y: 0.5, scale: 1 },
  lightbulb: { x: 0.26, y: 0.52, scale: 1.15 },
  orb: { x: 0.24, y: 0.55, scale: 0.85 },
}
const SCREEN_MOBILE: Record<Shape, { x: number; y: number; scale: number }> = {
  brain: { x: 0.5, y: 0.25, scale: 0.48 },
  scatter: { x: 0.5, y: 0.5, scale: 1 },
  lightbulb: { x: 0.5, y: 0.32, scale: 0.56 },
  orb: { x: 0.5, y: 0.245, scale: 0.42 },
}
const SCREEN_COMPACT: typeof SCREEN_MOBILE = {
  ...SCREEN_MOBILE,
  brain: { x: 0.77, y: 0.32, scale: 0.27 },
  lightbulb: { x: 0.5, y: 0.28, scale: 0.40 },
  orb: { x: 0.5, y: 0.205, scale: 0.23 },
}
const POINT_SIZES: Record<Shape, number> = { brain: 0.046, scatter: 0.050, lightbulb: 0.040, orb: 0.038 }

export function useConstellationScene(canvasRef: RefObject<HTMLCanvasElement>, progressRef: MutableRefObject<number>, reduceMotion: boolean) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const structuredCount = window.innerWidth < 768 ? 14000 : 26000
    const ambientCount = window.innerWidth < 768 ? 40 : 90

    let brainReady = false
    const brainCloud: Cloud = { pos: new Float32Array(structuredCount * 3), col: new Float32Array(structuredCount * 3) }
    const controller = new AbortController()
    const brainSurfaceGeometry = new THREE.BufferGeometry()
    const brainSurfaceMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, side: THREE.DoubleSide })
    const brainSurfaceMesh = new THREE.Mesh(brainSurfaceGeometry, brainSurfaceMaterial)
    brainSurfaceMesh.visible = false
    brainSurfaceMesh.renderOrder = -1
    Promise.all(['/models/brain-cortex.bin', '/models/brain-cortex-index.bin'].map(async url => {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) throw new Error(`Brain surface request failed: ${response.status}`)
      return response.arrayBuffer()
    }))
      .then(([buffer, indexBuffer]) => {
        if (controller.signal.aborted) return
        if (buffer.byteLength !== 20484 * 7 * 4 || indexBuffer.byteLength !== 40960 * 3 * 4) throw new Error('Invalid brain surface data')
        const surface = new Float32Array(buffer)
        const sampled = buildBrain(structuredCount, surface, new Uint32Array(indexBuffer))
        brainCloud.pos.set(sampled.pos)
        brainCloud.col.set(sampled.col)
        // A softly shaded inset surface reveals folds and occludes far-side particles.
        const inset = new Float32Array(20484 * 3)
        const shading = new Float32Array(20484 * 3)
        for (let i = 0; i < 20484; i++) {
          for (let axis = 0; axis < 3; axis++) inset[i * 3 + axis] = surface[i * 7 + axis] - surface[i * 7 + axis + 3] * 0.004
          const color = brainColor(surface[i * 7 + 3], surface[i * 7 + 4], surface[i * 7 + 5], surface[i * 7 + 6]).multiplyScalar(0.075)
          shading.set([color.r, color.g, color.b], i * 3)
        }
        brainSurfaceGeometry.setAttribute('color', new THREE.BufferAttribute(shading, 3))
        brainSurfaceGeometry.setAttribute('position', new THREE.BufferAttribute(inset, 3))
        brainSurfaceGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indexBuffer), 1))
        brainReady = true
        if (reduceMotion) render(0)
      })
      .catch(error => {
        if (!controller.signal.aborted) console.warn('Unable to load brain surface', error)
      })
    const bulbCloud = buildLightbulb(structuredCount)
    const orbCloud = buildOrb(structuredCount)
    const scatterCloud: Cloud = { pos: new Float32Array(structuredCount * 3), col: new Float32Array(structuredCount * 3) }
    for (let i = 0; i < structuredCount; i++) {
      scatterCloud.pos.set([rand(-5.5, 5.5), rand(-3.4, 3.4), rand(-2.5, 2)], i * 3)
      scatterCloud.col.set(hex01(pick(AMBIENT_COLORS)), i * 3)
    }
    const clouds: Record<Shape, Cloud> = { brain: brainCloud, scatter: scatterCloud, lightbulb: bulbCloud, orb: orbCloud }

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
    scene.add(brainSurfaceMesh)
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50)
    camera.position.set(0, 0, 6)

    const sprite = makeTriangleSprite()

    const structuredGeom = new THREE.BufferGeometry()
    const livePos = new Float32Array(structuredCount * 3)
    const liveCol = new Float32Array(structuredCount * 3)
    structuredGeom.setAttribute('position', new THREE.BufferAttribute(livePos, 3))
    structuredGeom.setAttribute('color', new THREE.BufferAttribute(liveCol, 3))
    const seeds = Float32Array.from({ length: structuredCount }, () => Math.random())
    structuredGeom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    const structuredMat = new THREE.PointsMaterial({
      size: 0.032,
      map: sprite,
      transparent: true,
      opacity: 1,
      alphaTest: 0.02,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    })
    structuredMat.onBeforeCompile = (shader) => {
      shader.vertexShader = 'attribute float aSeed; varying float vSeed;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('gl_PointSize = size;', 'vSeed = aSeed; gl_PointSize = size * (0.6 + aSeed * 0.8);')
      shader.fragmentShader = 'varying float vSeed;\n' + shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_particle_fragment>', THREE.ShaderChunk.map_particle_fragment.replace(
        'diffuseColor *= texture2D( map, uv );',
        'float a = vSeed * 6.283185; vec2 p = uv - 0.5; uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * p + 0.5; diffuseColor *= texture2D(map, uv);'
      ))
    }
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
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.24, 0.18, 0.85)
    composer.addPass(bloom)
    const output = new OutputPass()
    composer.addPass(output)

    let vw = 0
    let vh = 0
    let isMobile = window.innerWidth < 1024
    let raf = 0
    const pointer = { x: 0, y: 0 }
    const smoothedPointer = { x: 0, y: 0 }

    function worldOffset(fx: number, fy: number, depth: number) {
      const halfH = depth * Math.tan((camera.fov * Math.PI) / 360)
      const halfW = halfH * camera.aspect
      return { x: (fx - 0.5) * 2 * halfW, y: (0.5 - fy) * 2 * halfH }
    }

    function resize() {
      const bounds = canvas!.getBoundingClientRect()
      vw = bounds.width
      vh = bounds.height
      isMobile = vw < 1024
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(vw, vh, false)
      composer.setPixelRatio(dpr)
      composer.setSize(vw, vh)
      camera.aspect = vw / vh
      camera.updateProjectionMatrix()
      if (reduceMotion) render(0)
    }

    function onPointerMove(e: PointerEvent) {
      pointer.x = (e.clientX / vw - 0.5) * 2
      pointer.y = (e.clientY / vh - 0.5) * 2
    }

    function render(time: number) {
      // Geometry and copy use the same scroll position; only pointer movement is damped.
      const progress = reduceMotion ? 0 : progressRef.current
      smoothedPointer.x = lerp(smoothedPointer.x, pointer.x, 0.08)
      smoothedPointer.y = lerp(smoothedPointer.y, pointer.y, 0.08)

      const { shapeA, shapeB, localT } = currentShapes(progress)
      const eased = smoothstep(localT)
      const morphing = shapeA !== shapeB
      const cloudA = clouds[shapeA]
      const cloudB = clouds[shapeB]
      const scattered = (shapeA === 'scatter' ? 1 - eased : 0) + (shapeB === 'scatter' ? eased : 0)
      structuredMat.opacity = !brainReady && (shapeA === 'brain' || shapeB === 'brain') ? 0 : 1 - scattered * 0.65
      const screens = vw <= 360 && vh <= 640 ? SCREEN_COMPACT : isMobile ? SCREEN_MOBILE : SCREEN_DESKTOP
      const sa = screens[shapeA]
      const sb = screens[shapeB]
      const depth = camera.position.z
      const offA = worldOffset(sa.x, sa.y, depth)
      const offB = worldOffset(sb.x, sb.y, depth)
      const groupX = lerp(offA.x, offB.x, eased)
      const groupY = lerp(offA.y, offB.y, eased)
      // Keep the full silhouette inside its half of the frame on narrow desktops.
      const fit = isMobile ? Math.min(1, (vw / vh) / 0.53) : Math.min(1, (vw / vh) / 1.5)
      const groupScale = lerp(sa.scale, sb.scale, eased) * fit
      // Preserve visual density when resizing across the initial particle budget.
      const densityScale = Math.sqrt((vw < 768 ? 14000 : 26000) / structuredCount)
      const screenDensity = vw <= 360 && vh <= 640 ? 0.7 : isMobile ? 0.85 : 1
      structuredMat.size = lerp(POINT_SIZES[shapeA], POINT_SIZES[shapeB], eased) * densityScale * screenDensity

      const burst = !reduceMotion && morphing && shapeA !== 'scatter' && shapeB !== 'scatter' ? Math.sin(Math.PI * eased) * 0.12 : 0
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
          x += Math.sin(t * 0.5 + phase) * (0.002 + scattered * 0.12)
          y += Math.cos(t * 0.42 + phase) * (0.002 + scattered * 0.12)
        }

        livePos[i3] = x
        livePos[i3 + 1] = y
        livePos[i3 + 2] = z

        // Smoothly interpolate RGB colors between shape A and B
        const ar = cloudA.col[i3]
        const ag = cloudA.col[i3 + 1]
        const ab = cloudA.col[i3 + 2]
        const br = cloudB.col[i3]
        const bg = cloudB.col[i3 + 1]
        const bb = cloudB.col[i3 + 2]
        liveCol[i3] = lerp(ar, br, eased)
        liveCol[i3 + 1] = lerp(ag, bg, eased)
        liveCol[i3 + 2] = lerp(ab, bb, eased)
      }
      structuredGeom.attributes.position.needsUpdate = true
      structuredGeom.attributes.color.needsUpdate = true

      structuredPoints.position.set(groupX, groupY, 0)
      structuredPoints.scale.setScalar(groupScale)

      if (!reduceMotion) {
        structuredPoints.rotation.y = Math.sin(t * 0.06) * 0.06 + smoothedPointer.x * 0.06
        structuredPoints.rotation.x = smoothedPointer.y * 0.04

        const ambientArr = ambientGeom.attributes.position.array as Float32Array
        for (let i = 0; i < ambientCount; i++) {
          const i3 = i * 3
          const drift = t * 0.08 + ambientPhase[i]
          ambientArr[i3] = ambientPos[i3] + Math.sin(drift) * 0.15
          ambientArr[i3 + 1] = ambientPos[i3 + 1] + Math.cos(drift * 0.8) * 0.15
        }
        ambientGeom.attributes.position.needsUpdate = true
      }

      const brainWeight = (shapeA === 'brain' ? 1 - eased : 0) + (shapeB === 'brain' ? eased : 0)
      brainSurfaceMesh.visible = brainReady && brainWeight > 0.01
      brainSurfaceMaterial.opacity = Math.pow(brainWeight, 4)
      brainSurfaceMaterial.depthWrite = brainWeight > 0.98
      brainSurfaceMesh.position.copy(structuredPoints.position)
      brainSurfaceMesh.scale.copy(structuredPoints.scale)
      brainSurfaceMesh.rotation.copy(structuredPoints.rotation)
      composer.render()
    }

    let inView = true

    function frame(time: number) {
      render(time)
      raf = requestAnimationFrame(frame)
    }

    function updatePlayback() {
      cancelAnimationFrame(raf)
      if (!reduceMotion && inView && !document.hidden) raf = requestAnimationFrame(frame)
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      updatePlayback()
    })
    intersectionObserver.observe(canvas)
    document.addEventListener('visibilitychange', updatePlayback)

    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    }
    updatePlayback()

    return () => {
      controller.abort()
      brainSurfaceGeometry.dispose()
      brainSurfaceMaterial.dispose()
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', updatePlayback)
      window.removeEventListener('pointermove', onPointerMove)
      bloom.dispose()
      output.dispose()
      composer.dispose()
      renderer.dispose()
      structuredGeom.dispose()
      structuredMat.dispose()
      ambientGeom.dispose()
      ambientMat.dispose()
      sprite.dispose()
    }
  }, [canvasRef, progressRef, reduceMotion])
}
