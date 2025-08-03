'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import i18next from 'i18next'
import en from '@/locales/En.json'
import es from '@/locales/Es.json'
import it from '@/locales/It.json'
import de from '@/locales/De.json'
import pt from '@/locales/Pt.json'
import ru from '@/locales/Ru.json'
import fr from '@/locales/Fr.json'

type TranslationType = {
  [key: string]: string
}
const translations: Record<string, TranslationType> = {
  en,
  es,
  it,
  de,
  pt,
  ru,
  fr
}

export default function IntroPage() {
  const router = useRouter()
  const [t, setT] = useState(translations['es'])

  useEffect(() => {
    const lang = localStorage.getItem('lang') || 'es'
    i18next.init({
      lng: lang,
      resources: {
        [lang]: {
          translation: translations[lang]
        }
      }
    }).then(() => {
      setT(translations[lang])
    })
  }, [])

  const handleContinue = () => {
    router.push('/registro')
  }

  return (
    <main className="min-h-screen bg-[#102E50] text-white px-6 py-12 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-3xl text-center space-y-6"
      >
        <h1 className="text-3xl font-bold">{t.bienvenida}</h1>
        <p className="text-lg">{t.introDescripcion}</p>

        <div className="bg-white/10 p-4 rounded-xl shadow-md text-left space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-[#F5C45E]">{t.introQueEsTitulo}</h2>
            <p>{t.introQueEsDescripcion}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#E78B48]">{t.introQueUtilizaTitulo}</h2>
            <p>{t.introQueUtilizaDescripcion}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#BE3D2A]">{t.introAvisoTitulo}</h2>
            <p>{t.introAvisoDescripcion}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
          className="mt-8 px-8 py-3 bg-white text-[#102E50] rounded-xl font-bold shadow-md hover:bg-gray-100 transition"
        >
          {t.aceptarContinuar}
        </motion.button>
      </motion.div>
    </main>
  )
}