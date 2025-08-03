import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import i18next from 'i18next'

import en from '@/locales/En.json'
import es from '@/locales/Es.json'
import it from '@/locales/It.json'
import de from '@/locales/De.json'
import pt from '@/locales/Pt.json'
import ru from '@/locales/Ru.json'
import fr from '@/locales/Fr.json'

const translations = { en, es, it, de, pt, ru, fr }

export default function ModalContacto({ onClose }: { onClose: () => void }) {
  const lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'es'
  const t = translations[lang as keyof typeof translations] || es

  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !telefono) return
    setLoading(true)

    const registro = localStorage.getItem('registroData')
    const datosRegistro = registro ? JSON.parse(registro) : {}

    const res = await fetch('/api/enviar-contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email, celular: telefono, datosRegistro })
    })

    if (res.ok) {
      setEnviado(true)
    } else {
      alert('Error al enviar los datos. Intenta más tarde.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1E3A5F] p-6 rounded-2xl shadow-xl w-full max-w-md text-white"
        >
          {enviado ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-[#B4E50D]">
                {t.mensaje_datos1 || 'Gracias por enviar tus datos, inmediatamente nos pondremos en contacto con usted'}
              </h2>
              <button onClick={onClose} className="mt-4 px-6 py-2 bg-[#F25C9A] rounded-xl font-semibold hover:brightness-110 transition-all">
                OK
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#F5C45E] text-center">
                {t.contacto_titulo || 'Para contactar con un especialista en la Nueva Medicina Germánica'}
              </h2>
              <p className="text-center">{t.contacto_sub1 || 'Ingresa tus datos porfavor'}</p>
              <input
                type="email"
                placeholder={t.contacto_anun1 || 'Correo electrónico'}
                className="w-full p-3 rounded-xl bg-white text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="tel"
                placeholder={t.contacto_anun2 || 'Número celular'}
                className="w-full p-3 rounded-xl bg-white text-black"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-500 rounded-xl">Cancelar</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-[#5A4BFF] text-white rounded-xl font-bold hover:brightness-110 transition-all"
                >
                  {loading ? 'Enviando...' : t.contacto_button1 || 'Enviar'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}