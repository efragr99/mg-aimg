'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function SaberMasPage() {
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

  const mostrarContenido = (tipo: 'dhs' | 'percepcion' | 'sindromatica') => {
    if (tipo === 'dhs') {
      setContenido(`<h2 class='text-[#E78B48] text-xl md:text-2xl font-bold mb-2'>${t.encabezado_dhs}</h2><p class='text-white text-base md:text-lg leading-relaxed'>${t.desarrollo_dhs}</p>`)
    } else if (tipo === 'percepcion') {
      setContenido(`<h2 class='text-[#E78B48] text-xl md:text-2xl font-bold mb-2'>${t.encabezado_percepcion}</h2><p class='text-white text-base md:text-lg leading-relaxed'>${t.desarrollo_percepción}</p>`)
    } else if (tipo === 'sindromatica') {
      setContenido(`<h2 class='text-[#E78B48] text-xl md:text-2xl font-bold mb-2'>${t.encabezado_sidromatica}</h2><p class='text-white text-base md:text-lg leading-relaxed'>${t.desarrollo_sintomatica}</p>`)
    }
  }

  return (
    <main className="min-h-screen bg-[#102E50] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-10 text-center">
        <h1 className="text-3xl font-bold text-[#F5C45E]">
          {t.sabermas_titulo || 'Información importante para entender la Nueva Medicina Germánica'}
        </h1>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push('/leyesbiologicas')}
            className="bg-[#E7FBB4] text-black font-semibold px-5 py-3 rounded-xl shadow-md hover:scale-105 transition-all"
          >
            {t.sabermas_leyes || 'Las 5 leyes biológicas'}
          </button>
          <button
            onClick={() => mostrarContenido('percepcion')}
            className="bg-[#E7FBB4] text-black font-semibold px-5 py-3 rounded-xl shadow-md hover:scale-105 transition-all"
          >
            {t.sabermas_percepcion || '¿Qué es la percepción biológica?'}
          </button>
          <button
            onClick={() => mostrarContenido('dhs')}
            className="bg-[#E7FBB4] text-black font-semibold px-5 py-3 rounded-xl shadow-md hover:scale-105 transition-all"
          >
            {t.sabermas_DHS || '¿Qué es un DHS?'}
          </button>
          <button
            onClick={() => mostrarContenido('sindromatica')}
            className="bg-[#E7FBB4] text-black font-semibold px-5 py-3 rounded-xl shadow-md hover:scale-105 transition-all"
          >
            {t.sabermas_sindromatca || '¿Qué es la condición sindromática?'}
          </button>
        </div>

        <div className="bg-white/10 p-6 rounded-xl min-h-[200px] text-left" dangerouslySetInnerHTML={{ __html: contenido }}></div>

        <div className="flex flex-col md:flex-row justify-center gap-4 pt-6">
          <button
            onClick={handleVolver}
            className="bg-pink-500 hover:brightness-110 text-white font-bold px-6 py-3 rounded-full"
          >
            {t.button_regresar1 || 'Regresar'}
          </button>
          <button
            onClick={() => setMostrarModal(true)}
            className="bg-[#5A4BFF] hover:brightness-110 text-white font-bold px-6 py-3 rounded-full"
          >
            {t.button_contacto || 'Contactar terapeuta'}
          </button>
        </div>
      </div>
      {mostrarModal && <ModalContacto onClose={() => setMostrarModal(false)} />}
    </main>
  )
}
