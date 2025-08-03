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

const translations = { en, es, it, de, pt, ru, fr }

export default function RegistroPage() {
  const router = useRouter()
  const [t, setT] = useState(translations['es'])
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [sexo, setSexo] = useState('')
  const [lateralidad, setLateralidad] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [antecedente, setAntecedente] = useState('')
  const [antecedentes, setAntecedentes] = useState<string[]>([])
  const [sintoma, setSintoma] = useState('')
  const [sintomas, setSintomas] = useState<string[]>([])
  const [diagnostico, setDiagnostico] = useState('')
  const [diagnosticos, setDiagnosticos] = useState<string[]>([])

  useEffect(() => {
    const lang = (localStorage.getItem('lang') || 'es') as keyof typeof translations
    const options = {
      lng: lang,
      resources: {
        [lang]: {
          translation: translations[lang]
        }
      }
    }
    i18next.init(options).then(() => {
      setT(translations[lang] as typeof es)
    })
  }, [])

  const addItem = (type: 'antecedente' | 'sintoma' | 'diagnostico') => {
    if (type === 'antecedente' && antecedente.trim()) {
      setAntecedentes([...antecedentes, antecedente])
      setAntecedente('')
    }
    if (type === 'sintoma' && sintoma.trim()) {
      setSintomas([...sintomas, sintoma])
      setSintoma('')
    }
    if (type === 'diagnostico' && diagnostico.trim()) {
      setDiagnosticos([...diagnosticos, diagnostico])
      setDiagnostico('')
    }
  }

  const handleSubmit = async () => {
  // Validar campos obligatorios
  const camposFaltantes: string[] = []

  if (!sexo) camposFaltantes.push(t.sexo)
  if (!lateralidad) camposFaltantes.push(t.lateralidad)
  if (sintomas.length === 0) camposFaltantes.push(t.sintoma_detalle)
  if (antecedentes.length === 0) camposFaltantes.push(t.mas_antecedentes)

  if (camposFaltantes.length > 0) {
    alert(`${t.registro_error || 'Faltan campos obligatorios:'}\n\n- ${camposFaltantes.join('\n- ')}`)
    return
  }

  const data = {
    nombre,
    apellido,
    sexo,
    lateralidad,
    fechaNacimiento,
    antecedentes,
    sintomas,
    diagnosticos
  }

  localStorage.setItem('registroData', JSON.stringify(data))
  router.push('/analizando')
}

  return (
    <main className="min-h-screen bg-[#102E50] text-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-[#F5C45E] text-center drop-shadow-md">
        {t.registro_titulo}
      </h1>

      <div className="max-w-3xl mx-auto grid gap-6">
        <input className="input" placeholder={t.nombre} value={nombre} onChange={e => setNombre(e.target.value)} />
        <input className="input" placeholder={t.apellido} value={apellido} onChange={e => setApellido(e.target.value)} />

        <select className="input" value={sexo} onChange={e => setSexo(e.target.value)}>
          <option value="">{t.sexo}</option>
          <option value="masculino">{t.masculino}</option>
          <option value="femenino">{t.femenino}</option>
          <option value="otro">{t.otro}</option>
        </select>

        <select className="input" value={lateralidad} onChange={e => setLateralidad(e.target.value)}>
          <option value="">{t.lateralidad}</option>
          <option value="diestro">{t.diestro_a}</option>
          <option value="zurdo">{t.zurdo_a}</option>
          <option value="ambidiestro">{t.ambidiestro_a}</option>
        </select>

        <p className="text-sm text-white mb-1">{t.fecha_nacimiento}</p>
        <input type="date" className="input" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />

        <div>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder={t.sintoma_detalle} value={sintoma} onChange={e => setSintoma(e.target.value)} />
            <button onClick={() => addItem('sintoma')} className="btn">+</button>
          </div>
          <ul className="mt-2 list-disc list-inside text-sm text-[#F5C45E]">
            {sintomas.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <div>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder={t.mas_antecedentes} value={antecedente} onChange={e => setAntecedente(e.target.value)} />
            <button onClick={() => addItem('antecedente')} className="btn">+</button>
          </div>
          <ul className="mt-2 list-disc list-inside text-sm text-[#F5C45E]">
            {antecedentes.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>

        <div>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder={t.diagnostico_detalle} value={diagnostico} onChange={e => setDiagnostico(e.target.value)} />
            <button onClick={() => addItem('diagnostico')} className="btn">+</button>
          </div>
          <ul className="mt-2 list-disc list-inside text-sm text-[#F5C45E]">
            {diagnosticos.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>

        <button onClick={handleSubmit} className="btn bg-[#F5C45E] text-[#102E50] font-bold mt-6">
          {t.confirmar_continuar}
        </button>
      </div>

      <style jsx>{`
        .input {
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          background-color: #ffffff10;
          border: none;
          color: white;
          width: 100%;
          font-size: 1rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: background 0.3s ease;
        }
        .input:focus {
          outline: none;
          background-color: #ffffff20;
        }
        .input::placeholder {
          color: #ffffffaa;
        }
        select.input {
          background-color: #ffffff10;
          color: white;
        }
        select.input option {
          background-color: #102E50;
          color: #F5C45E;
        }
        .btn {
          background-color: #E78B48;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: bold;
          transition: 0.2s;
        }
        .btn:hover {
          background-color: #d77733;
        }
      `}</style>
    </main>
  )
}
