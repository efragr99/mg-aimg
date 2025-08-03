'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import i18next from 'i18next'

import en from '@/locales/En.json'
import es from '@/locales/Es.json'
import it from '@/locales/It.json'
import de from '@/locales/De.json'
import pt from '@/locales/Pt.json'
import ru from '@/locales/Ru.json'
import fr from '@/locales/Fr.json'

declare global {
  interface Window {
    kofiwidget2: any;
  }
}
const translations = { en, es, it, de, pt, ru, fr }

export default function DonarPage() {
  const router = useRouter()
  const lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'es'
  const t = translations[lang as keyof typeof translations] || es
  
  const [volverAResultado, setVolverAResultado] = useState(false)

useEffect(() => {
  const volver = localStorage.getItem('volver_con_conflicto')
  if (volver === '1') {
    setVolverAResultado(true)
  }
}, [])

const handleVolver = () => {
  if (volverAResultado) {
    localStorage.removeItem('volver_con_conflicto') // Limpia la intención
    router.push('/resultado')
  } else {
    router.back()
  }
}
  


  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Integración de Ko-fi multilenguaje
  useEffect(() => {
  const script = document.createElement('script')
  script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js'
  script.onload = () => {
    const texto = t?.button_donar || 'Support me on Ko-fi'
    const color = '#0d5edfff'
    const user = 'B0B51IM3LL'

    if (window.kofiwidget2) {
      window.kofiwidget2.init(texto, color, user)
      const html = window.kofiwidget2.getHTML()
      const container = document.getElementById('kofi-container')
      if (container) {
        container.innerHTML = html
      }
    }
  }

  document.body.appendChild(script)
}, [t])



  return (
   <main
  className="min-h-screen text-white flex flex-col md:flex-row"
  style={{
    backgroundImage: "url('/img/fondopage.png')",
    backgroundRepeat: 'repeat',
    backgroundSize: 'contain',
    backgroundColor: '#1C3A5F',
    opacity: 1 // mantenlo en 1 aquí, el patrón ya es sutil
  }}
>
      {/* IZQUIERDA: TEXTO */}
      <section className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center space-y-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-4xl font-bold text-[#FCFAEE]"
        >
          {t.donar_titulo || 'Tu apoyo puede transformar vidas'}
        </motion.h1>

        <p className="text-lg text-[#ffffffcc] max-w-xl">{t.donar_subtitulo1}</p>
        <p className="text-md text-[#ffffffbb] max-w-xl">{t.donar_contenido1}</p>
        <p className="text-md text-[#ffffffbb] max-w-xl italic">{t.donar_contenido2}</p>

        <div className="bg-[#102E50] p-6 rounded-xl max-w-xl text-left text-sm md:text-base shadow-lg">
          <h2 className="text-lg font-semibold text-[#F5C45E] mb-2">{t.donar_subtitulo2}</h2>
          <ul className="list-disc list-inside space-y-2 text-white">
            {t.donar_contenido3?.split('. ').map((line, i) => (
              <li key={i}>{line.trim()}</li>
            ))}
          </ul>
        </div>

        <p className="text-white font-semibold text-lg max-w-xl">
          {t.donar_contenido4}
        </p>

        <blockquote className="text-center text-[#F4F8D3] text-xl font-bold italic">
          “{t.donar_contenido5}”
        </blockquote>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-semibold text-[#8ABB6C]"
        >
          {t.donar_titulo2}
        </motion.h2>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button
            onClick={handleVolver}
            className="bg-[#B12C00] text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
          >
            {t.button_regresar1 || 'Regresar'}
          </button>

          {/* Botón Ko-fi renderizado dinámicamente */}
          <div
            id="kofi-container"
            className="flex justify-center items-center"
            dangerouslySetInnerHTML={{ __html: '' }}
          />
        </div>
      </section>

      {/* DERECHA: IMAGEN */}
      <section className="w-full md:w-1/2 relative hidden md:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/img/donarimg.png')",
            clipPath: 'polygon(25% 0%, 100% 0, 100% 100%, 0% 100%)'
          }}
        ></div>
      </section>
    </main>
  )
}
