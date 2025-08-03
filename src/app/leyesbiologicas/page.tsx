'use client' 

import { useState } from 'react'
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
import ModalContacto from '@/componentes/ModalContacto'

const translations = { en, es, it, de, pt, ru, fr }

export default function LeyesPage() {
  const router = useRouter()
  const lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'es'
  const t = translations[lang as keyof typeof translations] || es

  const [contenido, setContenido] = useState<{ titulo: string, desarrollo: string } | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const mostrarLey = (index: number) => {
    setContenido({
      titulo: t[`titulo_${index}ley` as keyof typeof t],
      desarrollo: t[`desarrollo_${index}ley` as keyof typeof t]
    })
  }

  return (
    <main className="min-h-screen bg-[#102E50] text-white p-6">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#F5C45E]">
          {t.encabezado_leyes || 'Información clave sobre las 5 Leyes Biológicas'}
        </h1>

        <div className="flex flex-wrap justify-center gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => mostrarLey(n)}
              className="bg-[#B4E50D] text-black px-4 py-2 rounded-xl font-semibold shadow hover:brightness-110 transition-all"
            >
              {t[`button_${n}ley` as keyof typeof t]}
            </button>
          ))}
        </div>

        {contenido && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1E3A5F] p-6 rounded-xl text-left text-lg"
          >
            <h2 className="text-[#E78B48] text-2xl font-bold mb-2">{contenido.titulo}</h2>
            <p className="whitespace-pre-line leading-relaxed">{contenido.desarrollo}</p>
          </motion.div>
        )}

        <div className="flex flex-wrap justify-center gap-4 pt-8">
          <button
            onClick={() => router.push('/sabermas')}
            className="bg-[#F25C9A] text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
          >
            {t.button_regresar1 || 'Regresar'}
          </button>

          <button
            onClick={() => setMostrarModal(true)}
            className="bg-[#5A4BFF] text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
          >
            {t.button_contacto || 'Contactar terapeuta'}
          </button>
        </div>
      </div>
      {mostrarModal && <ModalContacto onClose={() => setMostrarModal(false)} />}
    </main>
  )
}
