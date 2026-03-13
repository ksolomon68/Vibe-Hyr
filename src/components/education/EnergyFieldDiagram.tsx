'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function EnergyFieldDiagram() {
  const rings = [1, 2, 3, 4]
  const particles = Array.from({ length: 12 })

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center p-8 overflow-hidden bg-zinc-950/40 rounded-full border border-white/10 backdrop-blur-md">
      {/* Central Point */}
      <div className="relative z-10 w-5 h-5 rounded-full bg-orange-DEFAULT shadow-[0_0_40px_rgba(249,115,22,1)]" />
      
      {/* Glow Center */}
      <div className="absolute inset-0 bg-radial-gradient from-orange-DEFAULT/40 via-transparent to-transparent opacity-70" />

      {/* Concentric Rings */}
      {rings.map((ring, i) => (
        <motion.div
          key={`ring-${i}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.6, 0.2],
            borderWidth: [1.5, 2.5, 1.5]
          }}
          transition={{
            duration: 4,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: `${(i + 1) * 20 + 20}%`,
            height: `${(i + 1) * 20 + 20}%`,
          }}
          className="absolute rounded-full border border-white/20"
        />
      ))}

      {/* Orbiting Particles */}
      {particles.map((_, i) => {
        const radius = 35 + (i % 3) * 15 // Varied radii
        const duration = 10 + (i % 4) * 5 // Varied speeds
        const initialRotate = (i * 360) / particles.length

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute"
            style={{
              width: `${radius * 2}%`,
              height: `${radius * 2}%`,
              rotate: initialRotate,
            }}
            animate={{
              rotate: initialRotate + 360,
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange shadow-[0_0_12px_rgba(249,115,22,1)]"
              style={{
                opacity: 0.6 + (i % 3) * 0.2
              }}
            />
          </motion.div>
        )
      })}

      {/* Slow Pulse Glow Overlay */}
      <motion.div
        animate={{
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-radial-gradient from-orange-DEFAULT/15 via-transparent to-transparent"
      />
    </div>
  )
}
