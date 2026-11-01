'use client'

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import type { RefObject, MutableRefObject } from 'react'
import { useEffect } from 'react'

// Volumetric triangle clouds dissolve into a shared field before re-forming.
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

/** Surface shading keeps the folds legible instead of coloring every point at random. */
function surfaceColor(x: number, y: number, z: number, relief: number, tip = false): [number, number, number] {
  const silver = new THREE.Color('#E0E3E8')
  const gold = new THREE.Color('#D8BD86')
  // A quiet metallic finish: silver body, warm highlights along raised contours.
  const warmth = clamp01((relief - 0.65) * 0.6 + Math.abs(x) * 0.18)
  const color = silver.lerp(gold, warmth)
  if (tip && y < -0.45) color.multiplyScalar(0.85)
  const light = (0.45 + 0.55 * clamp01((z + 1.2) / 2.4)) * (0.12 + 0.88 * relief)
  color.multiplyScalar(light)
  return [color.r, color.g, color.b]
}

/** Two separate cortical hemispheres, a central fissure, and branching sulci. */
function buildBrain(n: number): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1
    const theta = Math.acos(rand(-1, 1))
    const phi = rand(-Math.PI / 2, Math.PI / 2)
    const sy = Math.cos(theta)
    const sz = Math.sin(theta) * Math.sin(phi)
    const sx = Math.sin(theta) * Math.cos(phi)
    // Broad winding ridges with narrower, darker grooves between them.
    const wave = Math.sin(sz * 12 + 2.4 * Math.sin(sy * 5) + sx * 4)
    const cross = Math.sin(sy * 13 + 1.8 * Math.sin(sz * 6))
    const groove = Math.pow(1 - Math.abs(wave), 2)
    const branch = Math.pow(1 - Math.abs(cross), 3) * 0.5
    const relief = 1 - Math.min(1, groove + branch)
    const fold = 1 - groove * 0.20 - branch * 0.14
    let x = side * (0.075 + sx * 0.88 * fold)
    let y = sy * 0.86 * fold + 0.12 - Math.max(0, sy) * Math.exp(-sx * 25) * 0.15
    let z = sz * 1.12 * fold
    // The underside tucks inward; no long stalk competing with the silhouette.
    if (y < -0.45) { x *= 0.9; z *= 0.9 }
    if (i > n * 0.97) {
      const angle = rand(0, PI2)
      const h = rand(0, 0.32)
      x = Math.cos(angle) * 0.12
      y = -0.73 - h
      z = -0.35 + Math.sin(angle) * 0.12
    }
    // Three-quarter view exposes the fissure and the depth of the folds.
    const turnedX = x * 0.94 + z * 0.34
    const turnedZ = z * 0.94 - x * 0.34
    pos.set([turnedX, y, turnedZ], i * 3)
    col.set(surfaceColor(x, y, turnedZ, relief), i * 3)
  }
  return { pos, col }
}

/** Continuous glass envelope, narrow neck, and a precisely wound screw base. */
function buildLightbulb(n: number): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const phi = rand(0, PI2)
    let x: number, y: number, z: number
    let relief = 0.85
    if (i < n * 0.82) {
      const t = rand(0, 1)
      y = 1.27 - t * 2.04
      // Interpolated radius profile closes the dome and flows smoothly into its neck.
      const profile = [0, 0.56, 0.79, 0.88, 0.87, 0.77, 0.60, 0.42, 0.28, 0.25]
      const f = t * (profile.length - 1)
      const k = Math.min(profile.length - 2, Math.floor(f))
      const radius = lerp(profile[k], profile[k + 1], (k === 0 ? Math.sqrt(f - k) : smoothstep(f - k)))
      x = Math.cos(phi) * radius
      z = Math.sin(phi) * radius
      relief = 0.55 + 0.45 * Math.abs(Math.cos(phi))
    } else if (i < n * 0.98) {
      const t = rand(0, 1)
      y = -0.77 - t * 0.43
      const thread = Math.sin(t * PI2 * 6 + phi)
      const radius = 0.25 - t * 0.04 + thread * 0.035
      relief = 0.45 + 0.55 * (thread * 0.5 + 0.5)
      x = Math.cos(phi) * radius
      z = Math.sin(phi) * radius
    } else {
      y = rand(-1.29, -1.20)
      x = Math.cos(phi) * 0.14
      z = Math.sin(phi) * 0.14
    }
    // Gentle tilt adds depth without losing the bulb's outline.
    pos.set([x * 0.985 + y * 0.17, y * 0.985 - x * 0.17, z], i * 3)
    col.set(surfaceColor(x, y, z, relief, true), i * 3)
  }
  return { pos, col }
}

/** Evenly sampled luminous globe with fine latitude/longitude accents. */
function buildOrb(n: number): Cloud {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - 2 * (i + 0.5) / n
    const radius = Math.sqrt(1 - y * y)
    const angle = i * goldenAngle
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const line = Math.pow(Math.abs(Math.cos(Math.asin(y) * 10)), 30)
    const meridian = Math.pow(Math.abs(Math.cos(angle * 6)), 40)
    pos.set([x * 1.15, y * 1.15, z * 1.15], i * 3)
    col.set(surfaceColor(x, y, z, 0.6 + Math.max(line, meridian) * 0.4), i * 3)
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
  ctx.lineWidth = 3.5
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 2
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
  brain: { x: 0.72, y: 0.53, scale: 1.22 },
  scatter: { x: 0.5, y: 0.5, scale: 1 },
  lightbulb: { x: 0.26, y: 0.52, scale: 1.15 },
  orb: { x: 0.24, y: 0.55, scale: 0.85 },
}
const SCREEN_MOBILE: Record<Shape, { x: number; y: number; scale: number }> = {
  brain: { x: 0.5, y: 0.22, scale: 0.46 },
  scatter: { x: 0.5, y: 0.5, scale: 1 },
  lightbulb: { x: 0.5, y: 0.26, scale: 0.48 },
  orb: { x: 0.5, y: 0.32, scale: 0.52 },
}

export function useConstellationScene(canvasRef: RefObject<HTMLCanvasElement>, progressRef: MutableRefObject<number>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const structuredCount = window.innerWidth < 768 ? 4200 : window.innerWidth < 1280 ? 8000 : 12000
    const ambientCount = window.innerWidth < 768 ? 90 : 200

    const brainCloud = buildBrain(structuredCount)
    const bulbCloud = buildLightbulb(structuredCount)
    const orbCloud = buildOrb(structuredCount)
    const scatterCloud: Cloud = { pos: new Float32Array(structuredCount * 3), col: brainCloud.col.slice() }
    for (let i = 0; i < structuredCount; i++) {
      scatterCloud.pos.set([rand(-5.5, 5.5), rand(-3.4, 3.4), rand(-2.5, 2)], i * 3)
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
      size: 0.042,
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
      shader.vertexShader = shader.vertexShader.replace('gl_PointSize = size;', 'vSeed = aSeed; gl_PointSize = size * (0.65 + aSeed * 0.9);')
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
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.52, 0.22, 0.48)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    let vw = 0
    let vh = 0
    let isMobile = window.innerWidth < 1024
    let raf = 0
    const pointer = { x: 0, y: 0 }
    const smoothedPointer = { x: 0, y: 0 }
    let smoothedProgress = progressRef.current

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
      // Lerp progress and mouse coords for butter-smooth animations
      smoothedProgress = reduceMotion ? 0 : progressRef.current
      smoothedPointer.x = lerp(smoothedPointer.x, pointer.x, 0.08)
      smoothedPointer.y = lerp(smoothedPointer.y, pointer.y, 0.08)

      const { shapeA, shapeB, localT } = currentShapes(smoothedProgress)
      const eased = smoothstep(localT)
      const morphing = shapeA !== shapeB
      const cloudA = clouds[shapeA]
      const cloudB = clouds[shapeB]
      const scattered = (shapeA === 'scatter' ? 1 - eased : 0) + (shapeB === 'scatter' ? eased : 0)
      structuredMat.opacity = 1 - scattered * 0.65
      const screens = isMobile ? SCREEN_MOBILE : SCREEN_DESKTOP
      const sa = screens[shapeA]
      const sb = screens[shapeB]
      const depth = camera.position.z
      const offA = worldOffset(sa.x, sa.y, depth)
      const offB = worldOffset(sb.x, sb.y, depth)
      const groupX = lerp(offA.x, offB.x, eased)
      const groupY = lerp(offA.y, offB.y, eased)
      const groupScale = lerp(sa.scale, sb.scale, eased)

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
          x += Math.sin(t * 0.5 + phase) * (0.012 + scattered * 0.12)
          y += Math.cos(t * 0.42 + phase) * (0.012 + scattered * 0.12)
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
        structuredPoints.rotation.y = Math.sin(t * 0.06) * 0.22 + smoothedPointer.x * 0.18
        structuredPoints.rotation.x = smoothedPointer.y * 0.1

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
