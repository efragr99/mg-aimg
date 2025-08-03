'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LanguagePage() {
  const handleSelect = (lang: string) => {
    localStorage.setItem('lang', lang)
    setTimeout(() => {
      window.location.href = '/intro'
    }, 100)
  }

  // Lista completa, pero solo se muestran los habilitados
  const languages = [
    { code: 'es', label: 'Español', emoji: '🇪🇸', enabled: true },
    { code: 'en', label: 'English', emoji: '🇬🇧', enabled: true },
    { code: 'it', label: 'Italiano', emoji: '🇮🇹', enabled: false },
    { code: 'de', label: 'Deutsch', emoji: '🇩🇪', enabled: false },
    { code: 'pt', label: 'Português', emoji: '🇧🇷', enabled: false },
    { code: 'fr', label: 'Français', emoji: '🇫🇷', enabled: false },
    { code: 'ru', label: 'Русский', emoji: '🇷🇺', enabled: false },
  ]

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#102E50] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#102E50] via-[#BE3D2A66] to-[#F5C45E66] blur-3xl opacity-30 animate-pulse z-0" />

      <motion.div
        className="z-10 text-white flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">🌐</h1>
        <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-6">
        {languages
          .filter((lang) => lang.enabled)
            .map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleSelect(lang.code)}
          className="bg-[#F5C45E] text-[#102E50] font-semibold px-6 py-3 rounded-2xl shadow-xl hover:bg-[#E78B48] transition-all text-lg hover:scale-105 active:scale-95"
        >
          {lang.emoji} {lang.label}
        </button>
      ))}
      </div>
    </div>
      </motion.div>
    </div>
  )
}



