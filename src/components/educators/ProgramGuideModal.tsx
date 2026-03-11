'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Loader2, Download, GraduationCap } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ProgramGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProgramGuideModal({ isOpen, onClose }: ProgramGuideModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form')
  const [formData, setFormData] = useState({
    institution: '',
    name: '',
    email: '',
    role: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('loading')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStep('success')
    toast.success('Guide sent to your email!')
    
    // Reset after success
    setTimeout(() => {
      onClose()
      setStep('form')
      setFormData({ institution: '', name: '', email: '', role: '' })
    }, 3000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-orange-DEFAULT transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-12">
              {step === 'form' && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-sm bg-orange-DEFAULT/10 flex items-center justify-center text-orange-DEFAULT">
                      <Download size={20} />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl text-white leading-tight">Download the Program Guide</h2>
                      <p className="text-sm text-white/40">Full curriculum, pricing, and implementation details.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[0.65rem] uppercase tracking-widest text-white/40 font-medium">Full Name</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:border-orange-DEFAULT outline-none transition-colors"
                          placeholder="Dr. Jordan Smith"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[0.65rem] uppercase tracking-widest text-white/40 font-medium">Work Email</label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:border-orange-DEFAULT outline-none transition-colors"
                          placeholder="j.smith@institution.edu"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] uppercase tracking-widest text-white/40 font-medium">Institution Name</label>
                      <input
                        required
                        type="text"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:border-orange-DEFAULT outline-none transition-colors"
                        placeholder="Westside High School"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] uppercase tracking-widest text-white/40 font-medium">Your Role</label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:border-orange-DEFAULT outline-none transition-colors appearance-none"
                      >
                        <option value="" className="bg-black text-white">Select your role</option>
                        <option value="Administrator" className="bg-black text-white">Administrator</option>
                        <option value="DEI Coordinator" className="bg-black text-white">DEI Coordinator</option>
                        <option value="Counselor" className="bg-black text-white">Counselor</option>
                        <option value="Teacher" className="bg-black text-white">Teacher</option>
                        <option value="Other" className="bg-black text-white">Other</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-DEFAULT hover:bg-orange-600 text-white font-medium py-4 rounded-sm shadow-lg shadow-orange-DEFAULT/20 transition-all flex items-center justify-center gap-2 group mt-4"
                    >
                      <span className="text-xs uppercase tracking-widest">Request Guide Access</span>
                      <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>

                    <p className="text-[0.65rem] text-center text-white/20 pt-4 leading-relaxed uppercase tracking-widest">
                      Your guide will be sent immediately via email.
                    </p>
                  </form>
                </>
              )}

              {step === 'loading' && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Loader2 size={40} className="text-orange-DEFAULT animate-spin mb-4" />
                  <h2 className="font-serif text-2xl text-white">Preparing Your Guide</h2>
                  <p className="text-sm text-white/40">Curating the latest curriculum details...</p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-orange-DEFAULT/10 rounded-full flex items-center justify-center text-orange-DEFAULT mb-6"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                  <h2 className="font-serif text-3xl text-white mb-2">Check Your Inbox</h2>
                  <p className="text-white/60 mb-8 max-w-sm mx-auto">
                    The 2025 Program Guide has been sent to <span className="text-white font-medium">{formData.email}</span>.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
