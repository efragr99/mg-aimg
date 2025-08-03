'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import i18next from 'i18next'

import en from '@/locales/En.json'
import es from '@/locales/Es.json'
import it from '@/locales/It.json'
import de from '@/locales/De.json'
import pt from '@/locales/Pt.json'
import ru from '@/locales/Ru.json'
import fr from '@/locales/Fr.json'
import ModalContacto from '@/componentes/ModalContacto'

const translations = { en, es, it, de, pt, ru, fr }

export default function TrabajandoPage() {
  const router = useRouter()
  const [t, setT] = useState(translations['es'])
  const [contenido, setContenido] = useState<string>('')
  const [mostrarModal, setMostrarModal] = useState(false)  

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
    const lang = (localStorage.getItem('lang') || 'es') as keyof typeof translations
    i18next.init({
      lng: lang,
      resources: { [lang]: { translation: translations[lang] } }
    }).then(() => setT(translations[lang] as typeof es))
  }, [])

  return (

    <main
  className="min-h-screen text-white p-8 flex flex-col items-center justify-center"
  style={{
    backgroundImage: "url('/img/fondopage.png')",
    backgroundRepeat: 'repeat',
    backgroundSize: 'contain',
    backgroundColor: '#1C3A5F',
    opacity: 1
  }}
>      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl bg-[#456882] p-10 rounded-2xl shadow-xl text-center space-y-6"
      >
        <h1 className="text-4xl font-bold text-[#FDF5AA]">
          {t.titulo_trabajando || '🚀 ¡Un nuevo servicio está en camino!'}
        </h1>
        <p className="text-xl font-bold text-[#F9F3EF]">
          {t.subt_trabajando || 'Estamos construyendo una experiencia premium para guiarte hacia tu recuperación profunda'}
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="space-y-4 text-lg text-left"
        >
          <ul className="list-disc ml-6 space-y-2  text-[#FFF2E0] ">
            <li>{t.item1_trabajando ||'Cálculo de tu carta astral, matriz del destino y test de personalidad'}</li>
            <li>{t.item2_trabajando || 'Registro diario de síntomas físicos, emocionales, diagnósticos o eventos'}</li>
            <li>{t.item3_trabajando || 'Guías por voz: meditaciones, afirmaciones, trabajo de chakras y más'}</li>
            <li>{t.item4_trabajando || 'Acceso a documentos PDF exclusivos y recomendaciones personalizadas'}</li>
            <li>{t.item5_trabajando || 'Medicina preventiva real con enfoque profesional y espiritual'}</li>
          </ul>
        </motion.div>
        <p className="italic text-sm font text-[#ECEFCA]">
          {t.label1_trabajando || 'Comparte esta WebApp y ayúdanos a construir un servicio único para ti 💖'}
        </p>

        <div className="flex justify-center gap-4 pt-6">
          <button
            onClick={handleVolver}
            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-5 py-2 rounded-xl shadow-md transition"
          >
            {t.button_regresar1}
          </button>
          <button
            onClick={() => setMostrarModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md transition"
          >
            {t.button_contacto}
          </button>
        </div>
      </motion.div>
      {mostrarModal && <ModalContacto onClose={() => setMostrarModal(false)} />}
    </main>
  )
}
