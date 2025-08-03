// src/utils/filtrarBase.ts

// src/app/utils/filtrarbase.ts
import import_base from '@/base/import_base'

function getOrganoKey(lang: string): string {
  const keys: Record<string, string> = {
    es: "Órgano o Sistema",
    en: "Organ or System",
    fr: "Organe ou Système",
    de: "Organ oder System",
    it: "Organo o Sistema",
    pt: "Órgão ou Sistema",
    ru: "Орган или Система",
  }
  return keys[lang] || "Órgano o Sistema"
}

type ConflictoMG = {
  ID: number
  "Órgano o Sistema": string
  "Conflicto Biológico": string
  [key: string]: any
}

export function agruparSintomas(sintomas: string, lang: string): string[] {
  const t = sintomas.toLowerCase()
  const grupos: string[] = []

  if (lang === 'es') {
    if (/fiebre|escalofr[ií]os|infección|bacteria|virus|gripe|hongos/.test(t)) grupos.push('infeccioso')
    if (/orina|vejiga|pis|micci[oó]n|dolor al orinar|turbia|ardor|retención/.test(t)) grupos.push('urinario')
    if (/vagina|vulva|pene|test[ií]culo|ovario|eyaculación|impotencia|pr[oó]stata/.test(t)) grupos.push('genital')
    if (/pecho|mama|glándula mamaria|axila|bulto|tumor|dolor en el pecho/.test(t)) grupos.push('mama')
    if (/corazón|palpitaciones|punzadas|torácico|presión en el pecho|ahogo/.test(t)) grupos.push('cardiaco')
    if (/ganglios|inflamación|linfa|hinchazón axilar/.test(t)) grupos.push('linfático')
    if (/hueso|fractura|dolor articular|columna|rodilla|hombro/.test(t)) grupos.push('óseo')
    if (/músculo|contractura|espasmo|debilidad muscular/.test(t)) grupos.push('muscular')
    if (/picor|sarpullido|erupción|ampolla|herida|eczema/.test(t)) grupos.push('piel')
    if (/tos|asma|bronquios|nariz tapada|sinusitis/.test(t)) grupos.push('respiratorio')
    if (/náusea|v[oó]mito|diarrea|estreñimiento|gases|c[oó]licos/.test(t)) grupos.push('digestivo')
    if (/visión borrosa|fotofobia|dolor ocular|pitido|pérdida auditiva|zumbido/.test(t)) grupos.push('sensorial')
    if (/mareo|entumecimiento|convulsiones|tics|migraña/.test(t)) grupos.push('nervioso')
    if (/ansiedad|depresión|culpa|desvalorización|estrés/.test(t)) grupos.push('emocional')
    if (/hormona|tiroides|insulina|menopausia|menstruación irregular/.test(t)) grupos.push('endocrino')
  } else if (lang === 'en') {
    if (/fever|chills|infection|bacteria|virus|flu|fungi/.test(t)) grupos.push('infectious')
    if (/urine|bladder|pee|micturition|painful urination|cloudy|burning|retention/.test(t)) grupos.push('urinary')
    if (/vagina|penis|testicle|ovary|ejaculation|impotence|prostate/.test(t)) grupos.push('genital')
    if (/breast|chest|mammary gland|armpit|lump|tumor|chest pain/.test(t)) grupos.push('breast')
    if (/heart|palpitations|stabbing|chest pressure|shortness of breath/.test(t)) grupos.push('cardiac')
    if (/lymph node|swelling|lymphatic/.test(t)) grupos.push('lymphatic')
    if (/bone|fracture|joint pain|spine|knee|shoulder/.test(t)) grupos.push('bone')
    if (/muscle pain|contracture|cramp|weakness/.test(t)) grupos.push('muscular')
    if (/itch|rash|blister|wound|eczema/.test(t)) grupos.push('skin')
    if (/cough|asthma|bronchus|blocked nose|sinusitis/.test(t)) grupos.push('respiratory')
    if (/nausea|vomiting|diarrhea|constipation|gas|cramps/.test(t)) grupos.push('digestive')
    if (/blurry vision|light sensitivity|eye pain|tinnitus|hearing loss/.test(t)) grupos.push('sensory')
    if (/dizziness|numbness|seizures|tics|migraine/.test(t)) grupos.push('nervous')
    if (/anxiety|depression|guilt|worthlessness|stress/.test(t)) grupos.push('emotional')
    if (/hormone|thyroid|insulin|menopause|irregular menstruation/.test(t)) grupos.push('endocrine')
  }

  return grupos
}

export function filtrarBase(sintomas: string, lang: string, base: any[], sexo: string) {
  const palabrasClave = sintomas.toLowerCase().match(/\b[\wáéíóúñü]+\b/g) || []
  const grupos = agruparSintomas(sintomas, lang)
  const resultados: ConflictoMG[] = []
  const db = import_base(lang)
  const organoKey = getOrganoKey(lang)

  db.forEach((item) => {
    const texto = JSON.stringify(item).toLowerCase()
    const organo = (item[organoKey] || '').toLowerCase()
    let score = 0

    if (sexo === 'masculino' && /útero|ovario|cérvix|trompas/.test(texto)) return
    if (sexo === 'femenino' && /test[ií]culo|pr[oó]stata|ves[ií]culas/.test(texto)) return

    palabrasClave.forEach((palabra) => {
      if (texto.includes(palabra)) score += 1
    })

    grupos.forEach((grupo) => {
      if (texto.includes(grupo)) score += 5
      if (organo.includes(grupo)) score += 3
    })

    if (score >= 3) {
      const organo_estandar = item[organoKey] || "Desconocido"
      resultados.push({ ...item, score })
    }
  })

  resultados.sort((a, b) => b.score - a.score)
  return resultados.length >= 5 ? resultados.slice(0, 10) : resultados
}

