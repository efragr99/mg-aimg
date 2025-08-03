'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import en from '@/locales/En.json'
import es from '@/locales/Es.json'
import it from '@/locales/It.json'
import de from '@/locales/De.json'
import pt from '@/locales/Pt.json'
import ru from '@/locales/Ru.json'
import fr from '@/locales/Fr.json'

const translations = { en, es, it, de, pt, ru, fr } as const
type Traducciones = Record<string, string>


type ModalProps = {
  onClose: () => void
}

export default function ModalErroresComentarios({ onClose }: ModalProps) {
  const [lang, setLang] = useState('es')
  const [t, setT] = useState<Traducciones>(translations['es'])

  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const idioma = (localStorage.getItem('lang') || 'es') as keyof typeof translations
    setLang(idioma)
    setT(translations[idioma])
  }, [])

  const handleSubmit = async () => {
    if (!mensaje.trim()) return
    setLoading(true)

    const registro = localStorage.getItem('registroData')
    const payload = {
      mensaje,
      registro: registro ? JSON.parse(registro) : {}
    }

    try {
      const res = await fetch('/api/enviar-comentario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) setEnviado(true)
    } catch (err) {
      console.error('Error al enviar mensaje:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          className="bg-[#1E3A5F] text-white p-6 rounded-2xl w-full max-w-md shadow-2xl"
        >
          {enviado ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-[#B4E50D]">
                {t.mensaje_comentarios || 'Gracias por enviarnos tu reporte y opinión'}
              </h2>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-[#F25C9A] rounded-xl font-semibold hover:brightness-110 transition"
              >
                OK
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#F5C45E] text-center">
                🛠️ {t.comentario_titulo1 || 'Déjanos tu comentario o notifica un error, eso nos ayuda a mejorar'}
              </h2>
              <textarea
                rows={5}
                placeholder="Escribe aquí tu mensaje..."
                className="w-full p-3 rounded-xl bg-white text-black"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-500 rounded-xl">
                  {t.button_cancelar || 'Cancelar'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-[#5A4BFF] text-white rounded-xl font-bold hover:brightness-110 transition"
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
