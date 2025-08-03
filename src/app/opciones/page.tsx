'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import i18next from 'i18next'
import { motion } from 'framer-motion'

import en from '@/locales/En.json'
import es from '@/locales/Es.json'
import it from '@/locales/It.json'
import de from '@/locales/De.json'
import pt from '@/locales/Pt.json'
import ru from '@/locales/Ru.json'
import fr from '@/locales/Fr.json'

const translations = { en, es, it, de, pt, ru, fr }

export default function OpcionesPage() {
  const router = useRouter()
  const [t, setT] = useState(translations['es'])
  const [opciones, setOpciones] = useState<any[]>([])
  const [seleccionada, setSeleccionada] = useState<number | null>(null)

  useEffect(() => {
    const lang = (localStorage.getItem('lang') || 'es') as keyof typeof translations
    i18next.init({
      lng: lang,
      resources: { [lang]: { translation: translations[lang] } }
    }).then(() => setT(translations[lang] as typeof es))

    const data = localStorage.getItem('opcionesConflictos')
    if (!data) {
      router.push('/registro')
    } else {
      try {
        const parsed = JSON.parse(data)
        // Verifica que las opciones estén en el nuevo formato con campo "t"
        const listaOpciones = parsed.opciones || parsed.options || parsed.optionen || 
        parsed.optionen || parsed.opzioni || parsed.opções || parsed.варианты 
        
        
        if (Array.isArray(parsed) && listaOpciones[0]?.t) {
          setOpciones(listaOpciones)
        } else if (Array.isArray(listaOpciones)) {
          // Si no están traducidas, las transformamos manualmente
          const opcionesTraducidas = listaOpciones.map((op) => ({
            original: op,
            t: {
              conflicto: op.conflicto,
              organo_tejido: op.organo_tejido,
              contexto_social: op.contexto_social,
              tipos_personalidad: op.tipos_personalidad
            }
          }))
          setOpciones(opcionesTraducidas)
        } else {
          router.push('/registro')
        }
      } catch (err) {
        console.error('Error al parsear IA:', err)
        router.push('/registro')
      }
    }
  }, [])

 const handleConfirmar = async () => {
  if (seleccionada === null) return

  const conflictoElegido = opciones[seleccionada]
  const lang = localStorage.getItem('lang') || 'es'

  const payload = {
    conflicto: conflictoElegido.original || conflictoElegido,
    lang: lang
  }

  // Primero guardar conflicto y redirigir a /analizando
  localStorage.setItem('modo','desarrollar')
  localStorage.setItem('conflictoSeleccionado', JSON.stringify(payload))
  router.push('/analizando')
}

  return (
    <main className="min-h-screen bg-[#102E50] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center text-[#F5C45E]">
          {t.titulo_opciones_cl || 'Dado que los datos ingresados coinciden o se comparten en varios programas biológicos especializados, te doy las siguientes opciones:'}
        </h1>

        <div className="space-y-6">
          {Array.isArray(opciones) && opciones.length > 0 &&
            opciones.map((item, index) => (
              item && item.t && (
                <motion.div
                  key={index}
                  onClick={() => setSeleccionada(index)}
                  className={`cursor-pointer bg-white/10 p-6 rounded-xl border-2 transition-all duration-200 ${seleccionada === index ? 'border-[#F5C45E] scale-[1.02]' : 'border-transparent'}`}
                  whileHover={{ scale: 1.01 }}
                >
                  <h3 className="text-xl font-semibold text-[#F5C45E]">🔎 {t.opcion} {index + 1}</h3>
                  <p className="mt-2"><strong>🧠 {t.nombre_conflicto || 'Conflicto'}:</strong> {item.t.conflicto}</p>
                  <p><strong>🫀 {t.organo_tejido || 'Órgano o tejido'}:</strong> {item.t.organo_tejido}</p>
                  <p><strong>🌍 {t.contexto_social || 'Contextos sociales'}:</strong> {item.t.contexto_social?.join(', ')}</p>
                  <p><strong>🧠 {t.tipos_personalidad || 'Personalidades'}:</strong> {item.t.tipos_personalidad?.join(', ')}</p>
                </motion.div>
              )
            ))
          }
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={handleConfirmar}
            disabled={seleccionada === null}
            className={`btn px-6 py-3 rounded-xl font-bold transition-all ${seleccionada !== null ? 'bg-[#BE3D2A] text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
          >
            {t.button_siguiente || 'Siguiente'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .btn:hover {
          filter: brightness(1.1);
        }
      `}</style>
    </main>
  )
}
