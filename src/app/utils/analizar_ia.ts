import OpenAI from 'openai'
import db from '@/base/import_base'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function analizarConIA(sintomas: string, lang: string) {
  const base = db(lang)

  const keyMap: any = {
    es: {
      conflicto: "Conflicto Biológico",
      organo: "Órgano o Sistema",
      tejido: "Tejido embrionario"
    },
    en: {
      conflicto: "Biological Conflict",
      organo: "Organ or System",
      tejido: "Embryonic Tissue"
    },
    fr: {
      conflicto: "Conflit Biologique",
      organo: "Organe ou Système",
      tejido: "Tissu embryonnaire"
    },
    // Puedes agregar más idiomas aquí si tienes la base
  }

  const keys = keyMap[lang] || keyMap['es']

  const resumenBase = base.slice(0, 50).map((c) => ({
    conflicto: c[keys.conflicto],
    organo_tejido: c[keys.organo],
    tejido_embrionario: c[keys.tejido],
  }))

  const promptPorIdioma: Record<string, string> = {
    es: `
Actúa como un médico experto en Medicina Germánica. Analiza los síntomas del paciente y propón los conflictos más coherentes según la siguiente base de datos:

BASE DE DATOS:
${JSON.stringify(resumenBase, null, 2)}

SÍNTOMAS DEL PACIENTE:
"${sintomas}"

Devuelve un JSON con el siguiente formato:
{
  "tipo": "opciones",
  "opciones": [
    {
      "conflicto": "Nombre del conflicto",
      "organo_tejido": "Órgano o tejido afectado",
      "tejido_embrionario": "Tejido",
      "contexto_social": ["..."],
      "tipos_personalidad": ["..."]
    }
  ]
}
Solo devuelve el JSON, sin texto adicional.
    `,
    en: `
Act as a professional doctor trained in Germanic Medicine. Analyze the patient's symptoms and propose the most coherent biological conflicts based on the following database:

DATABASE:
${JSON.stringify(resumenBase, null, 2)}

PATIENT'S SYMPTOMS:
"${sintomas}"

Return a JSON with the following format:
{
  "tipo": "opciones",
  "opciones": [
    {
      "conflicto": "Conflict name",
      "organo_tejido": "Affected organ or tissue",
      "tejido_embriionario": "Tissue",
      "contexto_social": ["..."],
      "tipos_personalidad": ["..."]
    }
  ]
}
Return only the JSON, with no additional text.
    `
    // Puedes añadir más idiomas: fr, pt, etc.
  }

  const prompt = promptPorIdioma[lang] || promptPorIdioma['es']

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4
  })

  try {
   const raw = completion.choices[0].message.content!.replace(/```json|```/g, '').trim()
  const json = JSON.parse(raw)
    return json
  } catch (e) {
    console.error('❌ Error parseando IA:', e)
    return null
  }
}
