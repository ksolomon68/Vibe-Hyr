'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Loader2, Calendar, Phone, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DiscoveryCallModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DiscoveryCallModal({ isOpen, onClose }: DiscoveryCallModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form')
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    teamSize: '',
    goals: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('loading')
    
    try {
      await fetch('https://formsubmit.co/ajax/k.solomon@live.com', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: `New Discovery Call Request: ${formData.company}`,
          _captcha: "false"
        })
      })
      
      setStep('success')
      toast.success('Discovery call request received!')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      setStep('form')
      return
    }
    
    // Reset after success
    setTimeout(() => {
      onClose()
      setStep('form')
      setFormData({ company: '', name: '', email: '', phone: '', teamSize: '', goals: '' })
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
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-black border border-white/10 rounded-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-DEFAULT via-gold to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-white/40 hover:text-orange-DEFAULT transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8 md:p-14">
              {step === 'form' && (
                <>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-sm bg-orange-DEFAULT/10 flex items-center justify-center text-orange-DEFAULT">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h2 className="font-serif text-3xl text-white leading-tight">Book a Discovery Call</h2>
                      <p className="text-sm text-white/40">15 minutes to discuss your team's culture and goals.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[0.65rem] uppercase tracking-widest text-white/40 font-bold">Your Name</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-white text-sm focus:border-orange-DEFAULT outline-none transition-colors"
                          placeholder="Alex Johnson"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.65rem] uppercase tracking-widest text-white/40 font-bold">Company Email</label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-white text-sm focus:border-orange-DEFAULT outline-none transition-colors"
                          placeholder="alex@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[0.65rem] uppercase tracking-widest text-white/40 font-bold">Company Name</label>
                        <input
                          required
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-white text-sm focus:border-orange-DEFAULT outline-none transition-colors"
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.65rem] uppercase tracking-widest text-white/40 font-bold">Team Size</label>
                        <select
                          required
                          value={formData.teamSize}
                          onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-white text-sm focus:border-orange-DEFAULT outline-none transition-colors appearance-none"
                        >
                          <option value="" className="bg-black">Select size</option>
                          <option value="1-10" className="bg-black">1-10 people</option>
                          <option value="11-50" className="bg-black">11-50 people</option>
                          <option value="51-200" className="bg-black">51-200 people</option>
                          <option value="200+" className="bg-black">200+ people</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.65rem] uppercase tracking-widest text-white/40 font-bold">Main Training Goals</label>
                        <textarea
                          rows={3}
                          value={formData.goals}
                          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-4 text-white text-sm focus:border-orange-DEFAULT outline-none transition-colors resize-none"
                          placeholder="What would you like to achieve?"
                        />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-DEFAULT hover:bg-orange-600 text-white font-bold py-5 rounded-sm shadow-xl shadow-orange-DEFAULT/20 transition-all flex items-center justify-center gap-3 group"
                    >
                      <span className="text-[0.8rem] uppercase tracking-[0.2em]">Request Call Access</span>
                      <Phone size={18} className="group-hover:rotate-12 transition-transform" />
                    </button>

                    <p className="text-[0.6rem] text-center text-white/20 uppercase tracking-widest leading-relaxed mt-6">
                      Our team will reach out within 24 business hours to schedule your session.
                    </p>
                  </form>
                </>
              )}

              {step === 'loading' && (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <Loader2 size={48} className="text-orange-DEFAULT animate-spin mb-6" />
                  <h2 className="font-serif text-3xl text-white">Opening the Schedule</h2>
                  <p className="text-sm text-white/40">Checking facilitator availability for your team...</p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-24 h-24 bg-orange-DEFAULT/10 rounded-full flex items-center justify-center text-orange-DEFAULT mb-8 shadow-inner shadow-orange-DEFAULT/20"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h2 className="font-serif text-4xl text-white mb-4">Request Sent</h2>
                  <p className="text-white/60 mb-10 max-w-sm mx-auto leading-relaxed">
                    We've received your inquiry for <span className="text-white font-medium">{formData.company}</span>. A Vibe Hyr consultant will email you shortly.
                  </p>
                  <div className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.2em] text-gold font-bold px-6 py-3 bg-gold/5 border border-gold/20 rounded-sm cursor-pointer hover:bg-gold/10 transition-colors" onClick={onClose}>
                    Return to Training Details
                    <ArrowRight size={16} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
