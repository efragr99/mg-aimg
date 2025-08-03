// route.ts
import { NextResponse, userAgent } from 'next/server'
import OpenAI from 'openai'
import { franc } from 'franc-min'
import langs from 'langs'
import db from '@/base/import_base'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
 const input = await req.json()
const body = {
  ...input.conflicto,
  idioma: input.lang || 'es' // ✅ importante para cargar bien la base e idioma
}

  const textoConflicto = Array.isArray(body.conflicto)
    ? body.conflicto.join(' ')
    : body.conflicto || ''
  // Detectar idioma desde los síntomas u otros campos ingresados
  const textoSintomas = [
    ...(body?.sintomas || []),
    ...(body?.antecedentes || []),
    body?.diagnostico || '',
    body?.conflicto || '',
    body?.organo_tejido || ''
  ].join(' ')
  

let lang = input?.idioma || input?.lang || 'es'
const base = db(lang)
console.log('🧬 Base cargada con', base.length, 'conflictos')
console.log('🧾 Recibido en el body:', body)
const limpiarTexto = (txt?: string) =>
 txt?.replace(/^Órgano o Sistema:\s*/i, '').trim()

const keysPosibles = ["Órgano o Sistema", "Organ or System", "Organo o Sistema"]

const conflictoSeleccionado = base.find(c => {
  for (const key of keysPosibles) {
    if (limpiarTexto(c[key]) === limpiarTexto(body.organo_tejido)) {
      return true
    }
  }
  return false
})

if (!conflictoSeleccionado) {
  console.error('❌ Conflicto NO encontrado. Buscado por:', {
    ID: body.id,
    organo_tejido: body.organo_tejido,
    idioma: lang,
    keysDisponibles: Object.keys(base[0])
  })
}

// 🔐 Mapas de claves por idioma
const keyMap: any = {
  es: {
    conflicto: "Conflicto Biológico",
    organo: "Órgano o Sistema",
    tejido: "Tejido embrionario",
    fase_activa: "Fase activa y síntomas",
    fase_resolucion: "Fase de resolución y síntomas",
    crisis_ep: "Crisis epileptoide",
    contexto: "Contexto social habitual",
    personalidad: "Tipos de personalidad",
    signo: "Signo zodiacal"
  },
  en: {
    conflicto: "Biological Conflict",
    organo: "Organ or System",
    tejido: "Embryonic Tissue",
    fase_activa: "Active Phase and Symptoms",
    fase_resolucion: "Resolution Phase and Symptoms",
    crisis_ep: "Epileptoid Crisis",
    contexto: "Typical Social Context",
    personalidad: "Personality Types",
    signo: "Zodiac Sign"
  },
  // Puedes agregar otros idiomas aquí si ya los tienes en base traducida
}

const keys = keyMap[lang] || keyMap['es'] // fallback español

const conflictoNormalizado = {
  conflicto_biologico: conflictoSeleccionado?.[keys.conflicto] || '',
  organo_tejido: conflictoSeleccionado?.[keys.organo] || '',
  tejido_embrionario: conflictoSeleccionado?.[keys.tejido] || '',
  fase_activa: conflictoSeleccionado?.[keys.fase_activa] || '',
  fase_resolucion: conflictoSeleccionado?.[keys.fase_resolucion] || '',
  crisis_epileptoide: conflictoSeleccionado?.[keys.crisis_ep] || '',
  contexto_social: conflictoSeleccionado?.[keys.contexto] || '',
  tipos_personalidad: conflictoSeleccionado?.[keys.personalidad] || '',
  signo_zodiacal: conflictoSeleccionado?.[keys.signo] || ''
}


const promptsPorIdioma: Record<string, string> = {
  es:
`Actúa como un médico profesional experto en Medicina Germánica, con un enfoque clínico preciso y razonado.

Eres un médico profesional con formación clínica en Medicina Germánica.

Tu única tarea es desarrollar el siguiente conflicto biológico de forma clara, clínica, razonada y profesional. NO debes analizar síntomas ni buscar coincidencias. No inventes campos.

Solo desarrolla este conflicto:
${JSON.stringify(conflictoNormalizado)}

Devuelve el resultado en formato JSON limpio, sin encabezados ni explicaciones externas. El contenido debe estar completamente en el idioma del paciente.

--- FORMATO ESPERADO ---
{
  "tipo": "unico",
  "conflicto_biologico": "Explicación clara y razonada del conflicto",
  "organo_tejido": "Órgano o tejido involucrado",
  "tejido_embrionario": "Tejido embrionario involucrado, según base de datos",
  "fase_activa": "Descripción detallada de la fase activa",
  "crisis_epileptoide": "Qué ocurre durante la crisis CE",
  "fase_resolucion": "Qué pasa en PCL-A y PCL-B",
  "consejos": ["Consejo 1", "Consejo 2", "Consejo 3"],
  "sugerencia_examenes": "Opcional. Solo si realmente es necesario, sugiere exámenes con lenguaje empático."
}
⚠️ Usa un lenguaje técnico, empático y profesional.
⚠️ IMPORTANTE: Tu respuesta debe ser un JSON limpio, sin markdown, sin emojis, sin explicaciones afuera. SOLO el objeto JSON.
`,
en:
`Act as a professional doctor specialized in Germanic Medicine, using a precise and reasoned clinical approach.

You are a professional medical therapist specialized in Germanic Medicine.

Your only task is to fully explain the following biological conflict, using professional, clinical and reasoned language. Do not analyze symptoms. Do not invent data or fields.

Only develop this conflict:
${JSON.stringify(conflictoNormalizado)}

Return your response in clean JSON format, without any extra explanations. The content must be fully written in the patient's language. 

--- EXPECTED FORMAT ---
{
  "tipo": "single",
  "conflicto_biologico": "Clear and reasoned explanation of the conflict",
  "organo_tejido": "Organ or tissue involved",
  "tejido_embrionario": "Embryonic tissue involved, according to the database",
  "fase_activa": "Detailed description of the active phase",
  "crisis_epileptoide": "What happens during the epileptoid crisis",
  "fase_resolucion": "What happens in PCL-A and PCL-B",
  "consejos": ["Tip 1", "Tip 2", "Tip 3"],
  "sugerencia_examenes": "Optional. Only if truly necessary, suggest exams using empathetic language."
}
  
⚠️ IMPORTANT: Your response must be a clean JSON object, with no markdown, no emojis, no external explanations. ONLY the JSON object.
`,
de:
`Handle als professioneller Therapeut der Germanischen Heilkunde. Du hast Zugriff auf eine strukturierte Datenbank mit biologischen Konflikten.

Deine Antwort muss vollständig in professionellem, klarem und natürlichem Deutsch verfasst sein. Verwende keine andere Sprache.

Beispiel: Wenn der Nutzer auf Französisch schreibt, muss deine Antwort zu 100 % auf Französisch sein.

⚠️ Deine Aufgabe ist es, **nur** den angegebenen Konflikt zu entwickeln, als ob der Patient ihn bereits ausgewählt hätte. Analysiere KEINE Symptome, erfinde KEINE neuen Konflikte.

🧠 Entwickle die Erklärung mit klarer, tiefer, professioneller Erzählweise und biologischer Logik. Verwende die Datenbank nur als Referenz, kopiere nichts wörtlich.

Wenn die Information über das embryonale Gewebe fehlt, **sage nicht "nicht spezifiziert"**, schreibe einfach: "Nicht in dieser Datenbank registriert."

--- PATIENTENDATEN ---
${JSON.stringify(body)}

--- AUSGEWÄHLTER KONFLIKT ---
${JSON.stringify(body)}

--- DATENBANK DER GERMANISCHEN HEILKUNDE ---
${JSON.stringify(base).slice(0, 15000)}...

--- ERWARTETES FORMAT ---
{
  "tipo": "einzeln",
  "conflicto_biologico": "Klare und begründete Erklärung des Konflikts",
  "organo_tejido": "Betroffenes Organ oder Gewebe",
  "tejido_embrionario": "Beteiligtes embryonales Gewebe laut Datenbank",
  "fase_activa": "Detaillierte Beschreibung der aktiven Phase",
  "crisis_epileptoide": "Was während der epileptoiden Krise geschieht",
  "fase_resolucion": "Was in PCL-A und PCL-B geschieht",
  "consejos": ["Tipp 1", "Tipp 2", "Tipp 3"],
  "sugerencia_examenes": "Optional. Nur wenn wirklich nötig, empfehle Untersuchungen mit einfühlsamer Sprache."
}
⚠️ IMPORTANT: Your response must be a clean JSON object, with no markdown, no emojis, no external explanations. ONLY the JSON object.
`,
fr:
`Agis comme un thérapeute professionnel en Médecine Germanique. Tu as accès à une base de données structurée des conflits biologiques.

Ta réponse doit être entièrement rédigée en français professionnel, clair et naturel. N'utilise aucune autre langue.

Exemple : si l'utilisateur a écrit en italien, ta réponse doit être 100 % en italien.

⚠️ Ta tâche est de développer **uniquement** le conflit fourni, comme si le patient l’avait déjà sélectionné. N’analyse PAS les symptômes, n’invente PAS de nouveaux conflits.

🧠 Développe l’explication avec un récit clair, profond, professionnel et basé sur la logique biologique. Utilise la base uniquement comme référence, ne copie pas mot à mot.

Si les données du tissu embryonnaire sont absentes de la base, **ne dis pas "non spécifié"**, écris simplement : "Non enregistré dans cette base de données."

--- DONNÉES DU PATIENT ---
${JSON.stringify(body)}

--- CONFLIT SÉLECTIONNÉ ---
${JSON.stringify(body)}

--- BASE DE DONNÉES DE MÉDECINE GERMANIQUE ---
${JSON.stringify(base).slice(0, 15000)}...

--- FORMAT ATTENDU ---
{
  "tipo": "unique",
  "conflicto_biologico": "Explication claire et raisonnée du conflit",
  "organo_tejido": "Organe ou tissu concerné",
  "tejido_embrionario": "Tissu embryonnaire impliqué, selon la base de données",
  "fase_activa": "Description détaillée de la phase active",
  "crisis_epileptoide": "Ce qui se passe pendant la crise épileptoïde",
  "fase_resolucion": "Ce qui se passe en PCL-A et PCL-B",
  "consejos": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "sugerencia_examenes": "Optionnel. Suggère des examens si nécessaire, avec un langage empathique."
}
  ⚠️ IMPORTANT : Ta réponse doit être un objet JSON propre, sans markdown, sans emojis, sans explications externes. UNIQUEMENT l’objet JSON.
`,
it:
`Agisci come un terapeuta professionista di Medicina Germanica. Hai accesso a un database strutturato con conflitti biologici.

La tua risposta deve essere completamente scritta in italiano professionale, chiaro e naturale. Non usare nessun'altra lingua.

Esempio: se l'utente ha scritto in tedesco, la tua risposta deve essere al 100% in tedesco.

⚠️ Il tuo compito è sviluppare **solo** il conflitto fornito, come se il paziente lo avesse già selezionato. NON analizzare sintomi, NON inventare nuovi conflitti.

🧠 Sviluppa la spiegazione con una narrativa chiara, profonda, professionale e basata sulla logica biologica. Usa il database solo come riferimento, non copiare letteralmente.

Se il dato del tessuto embrionale è assente, **non dire "non specificato"**, scrivi semplicemente: "Non registrato in questo database."

--- DATI DEL PAZIENTE ---
${JSON.stringify(body)}

--- CONFLITTO SELEZIONATO ---
${JSON.stringify(body)}

--- DATABASE DI MEDICINA GERMANICA ---
${JSON.stringify(base).slice(0, 15000)}...

--- FORMATO ATTESO ---
{
  "tipo": "singolo",
  "conflicto_biologico": "Spiegazione chiara e ragionata del conflitto",
  "organo_tejido": "Organo o tessuto coinvolto",
  "tejido_embrionario": "Tessuto embrionale coinvolto, secondo il database",
  "fase_activa": "Descrizione dettagliata della fase attiva",
  "crisis_epileptoide": "Cosa accade durante la crisi epileptoide",
  "fase_resolucion": "Cosa succede in PCL-A e PCL-B",
  "consejos": ["Consiglio 1", "Consiglio 2", "Consiglio 3"],
  "sugerencia_examenes": "Opzionale. Solo se necessario, suggerisci esami con linguaggio empatico."
}
⚠️ IMPORTANTE: La tua risposta deve essere un oggetto JSON pulito, senza markdown, senza emoji, senza spiegazioni esterne. SOLO l’oggetto JSON.
`,
pt:
`Atue como um terapeuta profissional de Medicina Germânica. Você tem acesso a um banco de dados estruturado com conflitos biológicos.

Sua resposta deve ser totalmente escrita em português profissional, claro e natural. Não use nenhum outro idioma.

Exemplo: se o usuário escreveu em francês, sua resposta deve estar 100% em francês.

⚠️ Sua tarefa é desenvolver **apenas** o conflito fornecido, como se o paciente já o tivesse selecionado. NÃO analise sintomas, NÃO invente novos conflitos.

🧠 Desenvolva a explicação com uma narrativa clara, profunda, profissional e focada na lógica biológica. Use o banco de dados apenas como referência, não copie literalmente.

Se o dado do tecido embrionário estiver ausente, **não diga "não especificado"**, apenas escreva: "Não registrado neste banco de dados."

--- DADOS DO PACIENTE ---
${JSON.stringify(body)}

--- CONFLITO SELECIONADO ---
${JSON.stringify(body)}

--- BANCO DE DADOS DE MEDICINA GERMÂNICA ---
${JSON.stringify(base).slice(0, 15000)}...

--- FORMATO ESPERADO ---
{
  "tipo": "único",
  "conflicto_biologico": "Explicação clara e fundamentada do conflito",
  "organo_tejido": "Órgão ou tecido envolvido",
  "tejido_embrionario": "Tecido embrionário envolvido, segundo o banco de dados",
  "fase_activa": "Descrição detalhada da fase ativa",
  "crisis_epileptoide": "O que ocorre durante a crise epileptoide",
  "fase_resolucion": "O que acontece nas fases PCL-A e PCL-B",
  "consejos": ["Conselho 1", "Conselho 2", "Conselho 3"],
  "sugerencia_examenes": "Opcional. Somente se necessário, sugerir exames com linguagem empática."
}
⚠️ IMPORTANTE: Sua resposta deve ser um JSON limpo, sem markdown, sem emojis, sem explicações externas. APENAS o objeto JSON.
`,
ru:
`Действуй как профессиональный терапевт Германской медицины. У тебя есть доступ к структурированной базе данных биологических конфликтов.

Твой ответ должен быть полностью написан на профессиональном, ясном и естественном русском языке. Не используй другие языки.

Пример: если пользователь написал на итальянском, ответ должен быть на 100% на итальянском.

⚠️ Твоя задача — разработать **только** предоставленный конфликт, как если бы пациент уже выбрал его. НЕ анализируй симптомы, НЕ выдумывай новые конфликты.

🧠 Развивай объяснение с четким, глубоким, профессиональным и биологически логичным изложением. Используй базу данных только как справочный материал, не копируй дословно.

Если данные о зародышевой ткани отсутствуют, **не пиши "не указано"**, просто напиши: "Не зарегистрировано в этой базе данных."

--- ДАННЫЕ ПАЦИЕНТА ---
${JSON.stringify(body)}

--- ВЫБРАННЫЙ КОНФЛИКТ ---
${JSON.stringify(body)}

--- БАЗА ДАННЫХ ГЕРМАНСКОЙ МЕДИЦИНЫ ---
${JSON.stringify(base).slice(0, 15000)}...

--- ОЖИДАЕМЫЙ ФОРМАТ ---
{
  "tipo": "один",
  "conflicto_biologico": "Четкое и обоснованное объяснение конфликта",
  "organo_tejido": "Задействованный орган или ткань",
  "tejido_embrionario": "Задействованная эмбриональная ткань (по базе данных)",
  "fase_activa": "Подробное описание активной фазы",
  "crisis_epileptoide": "Что происходит во время эпилептоидного криза",
  "fase_resolucion": "Что происходит в фазах PCL-A и PCL-B",
  "consejos": ["Совет 1", "Совет 2", "Совет 3"],
  "sugerencia_examenes": "Опционально. Только если действительно необходимо, предложи обследования с сочувственным тоном."
}
⚠️ ВАЖНО: Ответ должен быть в виде чистого JSON-объекта, без markdown, без эмодзи, без пояснений. ТОЛЬКО JSON-объект.
`,
}


const promptTexto = promptsPorIdioma[lang]
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-1106',
    messages: [{ role: 'user', 
    content: promptTexto}],
    temperature: 0.7
  })
  
  console.log('IDIOMA FINAL /desarrollar:', lang)
  console.log('Idioma detectado:', lang)
  console.log('Base cargada:', base[0])
  console.log('🔍 Recibido en /desarrollar:', body)

  //console.log('Conflicto seleccionado:', conflictoSeleccionado)
  
  const raw = completion.choices[0].message.content
  console.log('Respuesta IA', raw)
  try {
    
    const json = JSON.parse(raw!)

// ✅ Agregar disclaimer si es tipo "unico"
if (json.tipo === 'unico' || json.tipo === 'single' || json.tipo === 'único') {
  const disclaimers: Record<'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'ru', string> = {
    es: "⚠️ Este análisis tiene fines exclusivamente educativos y se basa en el enfoque clínico de la Medicina Germánica (5 Leyes Biológicas). No reemplaza el diagnóstico, tratamiento ni seguimiento médico convencional. Ante cualquier síntoma grave o duda, se recomienda consultar a su médico de confianza.",
    en: "⚠️ This analysis is for educational purposes only and based on the clinical framework of Germanic Medicine (5 Biological Laws). It does not replace conventional medical diagnosis, treatment, or follow-up. If you experience serious symptoms or doubts, please consult a trusted physician.",
    pt: "⚠️ Esta análise tem apenas fins educativos e baseia-se na Medicina Germânica (5 Leis Biológicas). Não substitui o diagnóstico, tratamento ou acompanhamento médico convencional. Em caso de dúvida ou sintomas graves, procure um médico de confiança.",
    fr: "⚠️ Cette analyse est à but éducatif uniquement et repose sur les principes de la Médecine Germanique (5 Lois Biologiques). Elle ne remplace pas un diagnostic, un traitement ou un suivi médical conventionnel.",
    de: "⚠️ Diese Analyse dient ausschließlich Bildungszwecken und basiert auf der Germanischen Heilkunde (5 Biologische Gesetze). Sie ersetzt keine medizinische Diagnose, Behandlung oder Betreuung durch einen Arzt.",
    it: "⚠️ Questa analisi ha solo scopo educativo e si basa sulla Medicina Germanica (5 Leggi Biologiche). Non sostituisce diagnosi, trattamento o monitoraggio medico convenzionale.",
    ru: "⚠️ Этот анализ предназначен исключительно для образовательных целей и основан на Германской Новой Медицине (5 Биологических Законов). Он не заменяет традиционную медицинскую диагностику и лечение."
  }

  // Si el idioma no está entre los permitidos, usa español por defecto
  json.disclaimer = disclaimers[lang as keyof typeof disclaimers] || disclaimers['es']
}

return NextResponse.json(json)
  } catch (err) {
    console.error('Error parseando respuesta IA:', err)
    return NextResponse.json({ error: 'Respuesta no válida de la IA', raw })
  }
}