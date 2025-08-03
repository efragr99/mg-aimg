'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lang = localStorage.getItem('lang')

    if (lang) {
      // Si ya hay idioma seleccionado, salta animación
      router.push('/app') // o la pantalla principal real de tu app
    } else {
      // Si NO hay idioma → muestra animación y redirige a /lang
      const timer = setTimeout(() => {
        router.push('/lang')
      }, 4000) // muestra animación 4 segundos

      return () => clearTimeout(timer)
    }
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#102E50]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        className="flex flex-col items-center"
      >
        <div className="rounded-full p-4 bg-gradient-to-tr from-[#BE3D2A] via-[#E78B48] to-[#F5C45E] shadow-xl">
          <img
            src="/logo.png"
            alt="Logo Germánico"
            className="w-40 h-40 object-contain"
          />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-6 text-white text-3xl font-bold text-center"
        >
        </motion.h1>
      </motion.div>
    </main>
  )
}




