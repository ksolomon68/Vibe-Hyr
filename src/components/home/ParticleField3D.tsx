'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 4000

// Generate brain-like point cloud
function generateBrainPoints(count: number) {
  const points = []
  for (let i = 0; i < count; i++) {
    // We want a shape that looks more like a lateral brain
    const u = Math.random()
    const v = Math.random()
    const theta = u * 2 * Math.PI
    const phi = Math.acos(2 * v - 1)
    const r = Math.cbrt(Math.random())
    
    // Elongated ellipsoid for lateral brain profile
    const x = r * Math.sin(phi) * Math.cos(theta) * 1.4
    const y = r * Math.cos(phi) * 1.0
    const z = r * Math.sin(phi) * Math.sin(theta) * 0.6
    
    // Add noise for lobes
    const noise = (Math.sin(x * 6) * Math.cos(y * 6) + Math.sin(z * 6)) * 0.08
    points.push(new THREE.Vector3(x + noise, y + noise, z + noise))
  }
  return points
}

// Generate lightbulb-like point cloud
function generateLightbulbPoints(count: number) {
  const points = []
  for (let i = 0; i < count; i++) {
    const isTop = Math.random() > 0.25 // 75% in bulb, 25% in base
    if (isTop) {
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(Math.random() * 2 - 1)
      const r = Math.cbrt(Math.random()) * 0.95
      points.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) + 0.5,
        r * Math.sin(phi) * Math.sin(theta) * 0.95
      ))
    } else {
      // Base (tapered cylinder)
      const h = (Math.random() - 1.0) * 0.8
      const radius = 0.4 + (h * 0.2) // taper
      const r = Math.sqrt(Math.random()) * radius
      const theta = Math.random() * 2 * Math.PI
      points.push(new THREE.Vector3(
        r * Math.cos(theta),
        h - 0.1,
        r * Math.sin(theta)
      ))
    }
  }
  return points
}

function ParticleMorph() {
  const wireMeshRef = useRef<THREE.InstancedMesh>(null)
  const fillMeshRef = useRef<THREE.InstancedMesh>(null)
  
  const { brainPoints, bulbPoints, colors, sizes, rotationOffsets, isFilled } = useMemo(() => {
    const brain = generateBrainPoints(PARTICLE_COUNT)
    const bulb = generateLightbulbPoints(PARTICLE_COUNT)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const rotationOffsets = new Float32Array(PARTICLE_COUNT * 3)
    const isFilled = new Array(PARTICLE_COUNT).fill(false)
    
    // Vibe Hyr Palette
    const palette = [
      new THREE.Color('#E8621A'),
      new THREE.Color('#E8621A'),
      new THREE.Color('#E8621A'),
      new THREE.Color('#F07840'),
      new THREE.Color('#F59060'),
      new THREE.Color('#FFB86B'),
      new THREE.Color('#EAB308'),
      new THREE.Color('#C9A84C'),
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#FFFFFF'), // more white sparks
    ]
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)]
      color.toArray(colors, i * 3)
      // Much smaller triangles, exact to reference
      sizes[i] = Math.random() * 0.015 + 0.005
      rotationOffsets[i * 3 + 0] = Math.random() * Math.PI * 2
      rotationOffsets[i * 3 + 1] = Math.random() * Math.PI * 2
      rotationOffsets[i * 3 + 2] = Math.random() * Math.PI * 2
      isFilled[i] = Math.random() < 0.15 // 15% filled, 85% wireframe
    }
    
    return { brainPoints: brain, bulbPoints: bulb, colors, sizes, rotationOffsets, isFilled }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const { viewport } = useThree()

  useFrame(({ clock, pointer }) => {
    if (!wireMeshRef.current || !fillMeshRef.current) return
    
    const t = clock.elapsedTime
    
    // Global morph mix based on time
    const morphCycle = (Math.sin(t * 0.4) + 1) / 2
    const mix = morphCycle < 0.25 ? 0 : morphCycle > 0.75 ? 1 : (morphCycle - 0.25) / 0.5
    
    let wireIdx = 0
    let fillIdx = 0
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const pBrain = brainPoints[i]
      const pBulb = bulbPoints[i]
      
      const cx = THREE.MathUtils.lerp(pBrain.x, pBulb.x, mix)
      const cy = THREE.MathUtils.lerp(pBrain.y, pBulb.y, mix)
      const cz = THREE.MathUtils.lerp(pBrain.z, pBulb.z, mix)
      
      const driftX = Math.sin(t * 0.6 + i) * 0.03
      const driftY = Math.cos(t * 0.5 + i) * 0.03
      const driftZ = Math.sin(t * 0.4 + i) * 0.03
      
      dummy.position.set(cx + driftX, cy + driftY, cz + driftZ)
      
      dummy.rotation.set(
        t * 0.15 + rotationOffsets[i * 3 + 0], 
        t * 0.25 + rotationOffsets[i * 3 + 1], 
        t * 0.35 + rotationOffsets[i * 3 + 2]
      )
      
      const pulse = (Math.sin(t * 3 + i) + 1) / 2
      dummy.scale.setScalar(sizes[i] + pulse * 0.005)
      
      dummy.updateMatrix()
      
      if (isFilled[i]) {
        fillMeshRef.current.setMatrixAt(fillIdx++, dummy.matrix)
      } else {
        wireMeshRef.current.setMatrixAt(wireIdx++, dummy.matrix)
      }
    }
    
    wireMeshRef.current.instanceMatrix.needsUpdate = true
    fillMeshRef.current.instanceMatrix.needsUpdate = true
    
    const targetRotY = t * 0.05 + (pointer.x * 0.3)
    const targetRotX = (pointer.y * 0.15)
    
    const s = Math.min(viewport.width / 3.5, 1.8)
    
    for (const mesh of [wireMeshRef.current, fillMeshRef.current]) {
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotY, 0.05)
      mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetRotX, 0.05)
      mesh.scale.setScalar(s)
    }
  })

  // We need two arrays of colors for the two meshes
  const wireColors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    let idx = 0
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (!isFilled[i]) {
        arr[idx * 3] = colors[i * 3]
        arr[idx * 3 + 1] = colors[i * 3 + 1]
        arr[idx * 3 + 2] = colors[i * 3 + 2]
        idx++
      }
    }
    return arr
  }, [colors, isFilled])
  
  const fillColors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    let idx = 0
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (isFilled[i]) {
        arr[idx * 3] = colors[i * 3]
        arr[idx * 3 + 1] = colors[i * 3 + 1]
        arr[idx * 3 + 2] = colors[i * 3 + 2]
        idx++
      }
    }
    return arr
  }, [colors, isFilled])

  const wireCount = useMemo(() => isFilled.filter(v => !v).length, [isFilled])
  const fillCount = useMemo(() => isFilled.filter(v => v).length, [isFilled])

  return (
    <group>
      <instancedMesh ref={wireMeshRef} args={[null as any, null as any, wireCount]}>
        <circleGeometry args={[1, 3]} /> 
        <meshBasicMaterial 
          transparent 
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          wireframe={true}
        />
        <instancedBufferAttribute attach="instanceColor" args={[wireColors, 3]} />
      </instancedMesh>
      
      <instancedMesh ref={fillMeshRef} args={[null as any, null as any, fillCount]}>
        <circleGeometry args={[1, 3]} /> 
        <meshBasicMaterial 
          transparent 
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
        <instancedBufferAttribute attach="instanceColor" args={[fillColors, 3]} />
      </instancedMesh>
    </group>
  )
}

export function ParticleField3D() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto" style={{ zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
        <React.Suspense fallback={null}>
          <ParticleMorph />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
