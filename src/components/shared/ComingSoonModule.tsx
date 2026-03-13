'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react'

export function ComingSoonModule({ 
  title = "Module Coming Soon", 
  subtitle = "The architecture of this reality is currently being mapped.",
  backLink = "/"
}: { 
  title?: string, 
  subtitle?: string,
  backLink?: string
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center space-y-8"
      >
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-[#E8621A]/10 blur-3xl rounded-full" />
          <BrainCircuit className="w-16 h-16 text-[#E8621A] mx-auto relative animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E8621A]/30 bg-[#E8621A]/5 text-[#E8621A] text-[10px] uppercase tracking-[0.2em] font-mono">
            <Sparkles size={10} /> Under Construction
          </div>
          <h1 className="text-4xl md:text-6xl font-display text-white tracking-wider leading-tight">
            {title.toUpperCase()}
          </h1>
          <p className="text-grey-DEFAULT font-body text-lg italic max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href={backLink}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-mono text-xs uppercase tracking-[0.2em] hover:bg-[#E8621A] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            Return to Reality <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 border border-white/10 text-white/50 font-mono text-xs uppercase tracking-[0.2em] hover:border-[#E8621A]/50 hover:text-white transition-all duration-300">
            Notify Me
          </button>
        </div>
      </motion.div>
    </div>
  )
}
