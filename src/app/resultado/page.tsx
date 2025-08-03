// Traducciones importadas
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
import ModalContacto from '@/componentes/ModalContacto'
import ModuloComentarios from '@/componentes/ModalComentarios'


const translations = { en, es, it, de, pt, ru, fr }

export default function ResultadoPage() {
  const router = useRouter()
  const [respuesta, setRespuesta] = useState<any | null>(null)
  const [t, setT] = useState(translations['es'])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModuloComentarios, setMostrarModuloComentarios] = useState(false)

  useEffect(() => {
    const lang = (localStorage.getItem('lang') || 'es') as keyof typeof translations
    i18next.init({
      lng: lang,
      resources: { [lang]: { translation: translations[lang] } }
    }).then(() => setT(translations[lang] as typeof es))

    const conflictoSeleccionado = localStorage.getItem('conflictoSeleccionado')
const respuestaRespaldo = localStorage.getItem('respuesta_respaldo')

if (!conflictoSeleccionado && respuestaRespaldo) {
  // El usuario volvió desde donar, no rehacemos fetch
  try {
    const data = JSON.parse(respuestaRespaldo)
    setRespuesta(data)
    localStorage.setItem('respuestaIA', respuestaRespaldo)
    return
  } catch (e) {
    console.error('Error parseando respaldo:', e)
    router.push('/registro')
    return
  }
}

if (conflictoSeleccionado) {
  const lang = localStorage.getItem('lang') || 'es'
  const datos = JSON.parse(conflictoSeleccionado)
  datos.lang = lang

  fetch('/api/desarrollar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(data => {
      setRespuesta(data)
      localStorage.setItem('respuestaIA', JSON.stringify(data))
      localStorage.setItem('respuesta_respaldo', JSON.stringify(data)) // respaldo para futuro
      localStorage.removeItem('conflictoSeleccionado')
    })
    .catch(err => {
      console.error('Error al desarrollar conflicto:', err)
      router.push('/registro')
    })
  return
}
   let raw = localStorage.getItem('respuestaIA') || localStorage.getItem('conflictoSeleccionado')

if (!raw) {
  const respaldo = localStorage.getItem('respuesta_respaldo')
  if (respaldo) {
    raw = respaldo
    localStorage.setItem('respuestaIA', respaldo) // restaurar para uso normal
    localStorage.setItem('conflictoSeleccionado', respaldo) // necesario para el fetch si recarga
  } else {
    router.push('/registro')
    return
  }
}

    try {
      const parsed = JSON.parse(raw)
      const tipo = parsed.tipo?.toLowerCase() || 'unico'

// Detecta si es una lista de opciones
if (
  tipo === 'optionen' || tipo === 'options' || tipo === 'opciones' || tipo === 'opzioni' ||
  tipo === 'opções' || tipo === 'варианты'
) {
  parsed.tipo = 'opciones'
}

// Detecta si es resultado único (en cualquier idioma)
if (
  tipo === 'unico' || tipo === 'single' || tipo === 'einzeln' || tipo === 'singolo' ||
  tipo === 'único' || tipo === 'unique' || tipo === 'один'
) {
  parsed.tipo = 'unico'
}


      if ((parsed.conflicto || parsed.conflicto_biologico) && parsed.organo_tejido) {
        const generado = {
          tipo: 'unico',
          conflicto_biologico: parsed.conflicto || parsed.conflicto_biologico,
          organo_tejido: parsed.organo_tejido,
          tejido_embrionario: parsed.tejido_embrionario || parsed.embriologia || t.default_embriologia,
          fase_activa: parsed.fase_activa || t.default_fase_activa,
          crisis_epileptoide: parsed.crisis_epileptoide || t.default_crisis_ep,
          fase_resolucion: parsed.fase_resolucion || t.default_resolucion_fase,
          consejos: parsed.consejos || [
            t.default_consejo_1,
            t.default_consejo_2,
            t.default_consejo_3
          ],
          sugerencia_examenes: parsed.sugerencia_examenes || t.default_examenes
        }
        setRespuesta(generado)
      } else {
        setRespuesta(parsed)
      }
    } catch (e) {
      console.error('Error parseando respuesta:', e)
      router.push('/registro')
    }
  }, [])

  if (!respuesta) return null

  const renderUnico = () => {
    return (
      <div className="space-y-4 text-left">
        <h2 className="text-xl font-bold text-[#F5C45E]">✅ {respuesta.conflicto_biologico}</h2>
        <p><strong>{t.organo_tejido}:</strong> {respuesta.organo_tejido}</p>
        {respuesta.tejido_embrionario && (
          <p><strong>{t.embriologia}:</strong> {respuesta.tejido_embrionario}</p>
        )}
        <p><strong>{t.fase_activa}:</strong> {respuesta.fase_activa}</p>
        <p><strong>{t.crisis_ep}:</strong> {respuesta.crisis_epileptoide}</p>
        <p><strong>{t.resolucion_fase}:</strong> {respuesta.fase_resolucion}</p>
        <div>
          <strong>{t.consejos || 'Recomendaciones'}:</strong>
          <ul className="list-disc ml-5">
            {respuesta.consejos?.map((c: string, i: number) => <li key={i}>{c}</li>)}
          </ul>
        </div>
        {respuesta.sugerencia_examenes && (
          <p className="italic text-sm text-gray-400 mt-2">{respuesta.sugerencia_examenes}</p>
        )}
        {respuesta.disclaimer && (
          <div className="mt-6 border-t border-gray-600 pt4">
            <p className=" text -xs text-gray-400 italic">{respuesta.disclaimer}</p>
            </div>
        )}
      </div>
    )
  }

  const renderSindrome = () => {
    return (
      <div className="space-y-4 text-left">
        <h2 className="text-xl font-bold text-[#F5C45E]">🧠 {t.sindrome_dect || 'Síndrome detectado'}</h2>
        <p>{respuesta.sindrome.descripcion}</p>
        <ul className="list-disc ml-5">
          {respuesta.sindrome.conflictos.map((c: any, i: number) => (
            <li key={i}><strong>{c.nombre}</strong> — {c.fase} — {c.organo}</li>
          ))}
        </ul>
      </div>
    )
  }

  const renderOpciones = () => {
    return (
      <div className="space-y-4 text-left">
        <h2 className="text-xl font-bold text-[#F5C45E]">📋 {t.opciones_conflicto || 'Conflictos posibles'}</h2>
        <ul className="list-disc ml-5">
          {respuesta.opciones?.map((op: any, i: number) => (
            <li key={i} className="mb-4">
              <strong>{op.conflicto}</strong><br />
              <span className="text-sm">
                <strong>{t.organo_tejido}:</strong> {op.organo_tejido}<br />
                <strong>{t.embriologia}:</strong> {op.tejido_embrionario}<br />
                <strong>{t.contexto_social}:</strong> {op.contexto_social?.join(', ')}<br />
                <strong>{t.tipos_personalidad}:</strong> {op.tipos_personalidad?.join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0E2A47] text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto space-y-6 bg-[#1C3A5F] p-6 rounded-2xl shadow-xl"
      >
        <h1 className="text-2xl font-bold text-center text-[#F5C45E]">{t.resultado_conflicto || 'Conflicto encontrado'}</h1>
        {['unico', 'single', 'singolo', 'einzeln', 'único', 'unique', 'один'].includes(respuesta.tipo?.toLowerCase()) && renderUnico()}
        {respuesta.tipo === 'sindrome' && renderSindrome()}
        {respuesta.tipo === 'opciones' && renderOpciones()}

        <div className="flex justify-center gap-4 pt-4">
          <button 
            onClick={() => {
               const respuesta = localStorage.getItem('respuestaIA') || localStorage.getItem('conflictoSeleccionado')
                if (respuesta) {
                localStorage.setItem('respuesta_respaldo', respuesta) // backup
                localStorage.setItem('volver_con_conflicto', '1')
              }
              router.push('/trabajando')
            }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition">
            🌱 {t.button_trabajar}
          </button>
          <button 
          onClick={() => {
               const respuesta = localStorage.getItem('respuestaIA') || localStorage.getItem('conflictoSeleccionado')
                if (respuesta) {
                localStorage.setItem('respuesta_respaldo', respuesta) // backup
                localStorage.setItem('volver_con_conflicto', '1')
              }
              router.push('/sabermas')
            }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition">
            ℹ️ {t.button_info}
          </button>
          <button
            onClick={() => router.push('/registro')}
            className="bg-neutral-300 hover:bg-neutral-400 text-black font-semibold px-4 py-2 rounded-xl shadow-md transition"
          >
            ↩ {t.button_regresar}
          </button>
          <div className="flex justify-center flex-wrap gap-4 pt-2">
            <button 
            onClick={() => {
               const respuesta = localStorage.getItem('respuestaIA') || localStorage.getItem('conflictoSeleccionado')
                if (respuesta) {
                localStorage.setItem('respuesta_respaldo', respuesta) // backup
                localStorage.setItem('volver_con_conflicto', '1')
              }
              router.push('/donar')
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition"
            >
                💖 {t.button_donar}
            </button>
            <button
          onClick={() => setMostrarModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition"
          >
              🧑‍⚕️ {t.button_contacto}
              </button>

          <button
               onClick={() => setMostrarModuloComentarios(true)}
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition"
          >
              🛠️ {t.button_error_coment}
          </button>
          </div>
        </div>
      </motion.div>
      {mostrarModal && <ModalContacto onClose={() => setMostrarModal(false)} />}
      {mostrarModuloComentarios && <ModuloComentarios onClose={() => setMostrarModuloComentarios(false)} />}
    </main>
  )
}
