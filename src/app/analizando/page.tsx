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

const translations = { en, es, it, de, pt, ru, fr }

export default function AnalizandoPage() {
  const router = useRouter()
  const [t, setT] = useState(translations['es'])

  useEffect(() => {
    const lang = (localStorage.getItem('lang') || 'es') as keyof typeof translations
    i18next.init({
      lng: lang,
      resources: { [lang]: { translation: translations[lang] } }
    }).then(() => setT(translations[lang] as typeof es))

    // 🟡 Detectar si viene de selección de conflicto
    const conflictoSeleccionado = localStorage.getItem('conflictoSeleccionado')
    if (conflictoSeleccionado) {
      router.push('/resultado') // ahí se desarrolla automáticamente
      return
    }

    const dataRaw = localStorage.getItem('registroData')
    if (!dataRaw) {
      router.push('/registro')
      return
    }

    // Agregar idioma al payload
    const data = JSON.parse(dataRaw)
    const payload = {
      ...data,
      lang
    }

    // Llamada real a la IA para analizar
    fetch('/api/analizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(result => {
        try {
          const tipo = result?.tipo?.toLowerCase?.() || ''

          if (
            tipo === 'opciones' || tipo === 'options' || tipo === 'optionen' ||
            tipo === 'opções' || tipo === 'opzioni' || tipo === 'варианты'
          ) {
            localStorage.setItem('opcionesConflictos', JSON.stringify(result))
            router.push('/opciones')
          } else if (
            tipo === 'sindrome' || tipo === 'unico' || tipo === 'single' ||
            tipo === 'unique' || tipo === 'einzeln' || tipo === 'único'
          ) {
            localStorage.setItem('respuestaIA', JSON.stringify(result))
            router.push('/resultado')
          } else {
            throw new Error('Respuesta no reconocida')
          }
        } catch (e) {
          console.error('Error analizando:', e)
          router.push('/registro')
        }
      })
      .catch(err => {
        console.error('Error conexión IA:', err)
        router.push('/registro')
      })
  }, [])

  return (
    <main className="min-h-screen bg-[#1C3A5F] text-white flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="space-y-6"
      >
        <div className="loader mb-6"></div>
        <h1 className="text-xl md:text-2xl font-bold text-[#F5C45E]">
          {t.cargando_conflicto || 'Investigando posible conflicto, espera porfavor...'}
        </h1>
      </motion.div>

      {/* Estilos loader */}
      <style jsx>{`
        .loader {
          border: 6px solid rgba(255, 255, 255, 0.2);
          border-top: 6px solid #F5C45E;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
