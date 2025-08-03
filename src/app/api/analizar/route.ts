import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import db from '@/base/import_base'
import  {filtrarBase}   from '@/app/utils/filtrarbase'
import { franc } from 'franc-min'
import langs from 'langs'
import { analizarConIA } from '@/app/utils/analizar_ia'



const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const body = await req.json()

   // 🔒 Validación de campos obligatorios (excepto diagnóstico)
  if (!body.sintomas || !body.antecedentes || !body.sexo || !body.lateralidad) {
    return new Response(
      JSON.stringify({ error: 'Faltan campos obligatorios: síntomas, antecedentes, sexo o lateralidad.' }),
      { status: 400 }
    )
  }

   // 🧠 Preparar texto completo desde los datos
  const sintomas = Array.isArray(body.sintomas) ? body.sintomas.join('') : body.sintomas.trim()
  const antecedentes = Array.isArray(body.antecedentes)
      ?body.antecedentes.join('')
      :(body.antecedentes?.trim() || '')
  const diagnostico = Array.isArray(body.diagnostico)
  ? body.diagnostico.join(' ')
  : (body.diagnostico?.trim() || '')

  const sexo = (body.sexo || '').trim ()
  const lateralidad = (body.lateralidad || '').trim()

  const textoSintomas = `
  ⚠️ Analiza únicamente los síntomas actuales como base de diagnóstico.
  Los antecedentes médicos solo deben considerarse si afectan directamente los síntomas actuales.
  No pueden influir en el resultado si no tienen conexión clínica con lo que el paciente experimenta ahora.

  Síntomas actuales: ${sintomas}
  Antecedentes médicos relevantes (contexto): ${antecedentes}
  ${diagnostico ? `Diagnóstico clínico actual (si aplica): ${diagnostico}` : ''}
  Sexo del paciente: ${sexo}
  Lateralidad biológica (diestro o zurdo): ${lateralidad}
`.trim()

  // 🌍 Detección de idioma automática
  let lang = 'es'
  const supportedLangs = ['en', 'es', 'pt', 'it', 'de', 'fr', 'ru']

  try {
    if (body.idioma && supportedLangs.includes(body.idioma)) {
      lang = body.idioma
    } else {
      const langCode = franc(`${sintomas} ${antecedentes} ${diagnostico}`)
      const language = langs.where('3', langCode)
      if (language && supportedLangs.includes(language['1'])) {
        lang = language['1']
      }
    }
  } catch (err) {
    console.warn('Error detectando idioma:', err)
  }
const base = db(lang)  // carga la base según el idioma
if (!base) {
  return NextResponse.json({ error: 'Base no encontrada para el idioma seleccionado' }, { status: 500 })
}
 // Filtro de la base
const conflictos = filtrarBase(textoSintomas, lang, base, sexo)

if (conflictos.length === 0) {
  const resultadoIA = await analizarConIA(sintomas, lang)
  return NextResponse.json(resultadoIA)
}
 // 🧠 Añadir conflictos extra si hay muy pocos resultados
  if (conflictos.length < 4) {
    const palabras: string[] = sintomas
      .toLowerCase()
      .split(/\W+/)
      .filter((w: string): boolean => w.length > 3)

    const extras = base
      .filter((c: any): boolean => {
        const texto = JSON.stringify(c).toLowerCase()
        return palabras.some((p: string): boolean => texto.includes(p))
      })
      .slice(0, 3)

    // Evitar duplicados
    const idsExistentes = new Set(conflictos.map(c => c.ID))
    extras.forEach(e => {
      if (!idsExistentes.has(e.ID)) {
        conflictos.push(e)
      }
    })
  }
const resumenConflictos = conflictos.map((c) => {
  if (lang === 'en') {
    return {
      ID: c.ID,
      "Organ or System": c["Organ or System"],
      "Biological Conflict": c["Biological Conflict"],
      "Embryonic tissue": c["Embryonic tissue"],
      "Active phase and symptoms": c["Active phase and symptoms"]?.substring(0, 300),
      "Healing phase and symptoms": c["Healing phase and symptoms"]?.substring(0, 300)
    }
  }

  // Default español
  return {
    ID: c.ID,
    "Órgano o Sistema": c["Órgano o Sistema"],
    "Conflicto Biológico": c["Conflicto Biológico"],
    "Tejido embrionario": c["Tejido embrionario"],
    "Fase activa y síntomas": c["Fase activa y síntomas"]?.substring(0, 300),
    "Fase de resolución y síntomas": c["Fase de resolución y síntomas"]?.substring(0, 300)
  }
})

const disclaimer: string = {
    es: "⚠️ Este análisis tiene fines exclusivamente educativos y se basa en el enfoque clínico de la Medicina Germánica (5 Leyes Biológicas). No reemplaza el diagnóstico, tratamiento ni seguimiento médico convencional. Ante cualquier síntoma grave o duda, se recomienda consultar a su médico de confianza.",
    en: "⚠️ This analysis is for educational purposes only and based on the clinical framework of Germanic Medicine (5 Biological Laws). It does not replace conventional medical diagnosis, treatment, or follow-up. If you experience serious symptoms or doubts, please consult a trusted physician."
  }[lang] || "⚠️ Este análisis tiene fines exclusivamente educativos y se basa en el enfoque clínico de la Medicina Germánica (5 Leyes Biológicas). No reemplaza el diagnóstico, tratamiento ni seguimiento médico convencional. Ante cualquier síntoma grave o duda, se recomienda consultar a su médico de confianza."


// 🧾 Prompt principal
const prompts_anlz:Record<string, string> = {
es:
`Eres una inteligencia especializada en Medicina Germánica (5 Leyes Biológicas). Tu tarea es analizar los síntomas proporcionados por el usuario, y determinar el o los conflictos biológicos más coherentes basándote exclusivamente en los siguientes datos clínicos filtrados:

${JSON.stringify(resumenConflictos.slice(0,10))}

No puedes usar ningún conflicto fuera de esta lista. Si los síntomas no coinciden claramente con ninguno, responde con tipo = "opciones" y sugiere los más cercanos de la lista.

Analiza el conjunto de síntomas como un todo. Detecta si están en:
- Fase activa (CA)
- Crisis epileptoide (CE)
- Fase de solución (PCL-A / PCL-B)

Responde solo en el idioma detectado en los síntomas.
--- DATOS DEL PACIENTE ---
${textoSintomas}

--- BASE DE DATOS DE MEDICINA GERMÁNICA ---
${JSON.stringify(base).slice(0, 15000)}...

--- FORMATO ESPERADO ---
Si ningún conflicto se ajusta claramente a todos los síntomas — 
especialmente si la combinación de síntomas involucra sistemas diferentes (como respiratorio y urinario) — DEBES responder con el formato "tipo": "opciones".
solo puedes responder con el formato "opciones" y debes incluir conflictos del sistema urinario como riñones, uréteres o vejiga.
Si hay una coincidencia clara:
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

Si hay múltiples conflictos posibles:
{
  "tipo": "opciones",
  "opciones": [
    {
      "conflicto": "Nombre del conflicto",
      "organo_tejido": "Órgano o tejido involucrado",
      "tejido_embrionario": "Tejido embrionario",
      "contexto_social": ["Situaciones comunes que activan el conflicto"],
      "tipos_personalidad": ["Perfiles más vulnerables"]
    },
    ...
  ]
}
⚠️ Si hay algún síntoma que incluya: orina turbia, ardor al orinar, infección urinaria, micción dolorosa o alteraciones renales,
debes incluir al menos 1 conflicto urinario (riñón, pelvis renal, uréteres, vejiga) en las opciones obligatoriamente.
⚠️ Si los síntomas son vagos, internos, ambiguos o no permiten identificar una causa única clara, debes incluir al menos 3-4 opciones razonadas de diferentes tejidos o sistemas, no solo una o dos.
⚠️ Solo analiza los conflictos listados. No menciones otros.
⚠️ IMPORTANTE: Tu respuesta debe ser un JSON limpio, sin markdown, sin emojis, sin explicaciones afuera. SOLO el objeto JSON.
`,
en:
`
You are an AI specialized in Germanic Medicine (5 Biological Laws). Your task is to analyze the symptoms provided by the user and determine the most biologically coherent conflict(s) based strictly on the following filtered clinical data:

${JSON.stringify(resumenConflictos.slice(0,10))}

You may NOT use any conflict outside this list. If the symptoms do not clearly match any conflict, respond with "type": "options" and suggest the closest possible ones from the list.

Analyze the full symptom context holistically. Detect whether the user is in:
- Active phase (CA)
- Epileptoid crisis (CE)
- Healing phase (PCL-A / PCL-B)

Respond only in the language detected from the symptoms.
--- PATIENT DATA ---
${textoSintomas}

--- GERMANIC MEDICINE DATABASE ---
${JSON.stringify(base).slice(0, 15000)}...

--- EXPECTED FORMAT ---
If none of the conflicts clearly match all the symptoms — especially if the symptom combination involves different systems (e.g., respiratory and urinary) — you MUST respond using the "tipo": "opciones" format.
If there is a clear match:
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
If there are multiple possible conflicts:
{
  "tipo":"options": [
    {
      "conflicto": "Conflict name",
      "organo_tejido": "Organ or tissue involved",
      "tejido_embrionario": "Embryonic tissue",
      "contexto_social": ["Common situations that trigger the conflict"],
      "tipos_personalidad": ["Most vulnerable personality profiles"]
    }
  ]
}
  ⚠️ IMPORTANT:
If any symptom includes: **cloudy urine**, **burning when urinating**, **urinary infection**, **kidney pain**, or other urinary signs, 
you MUST include at least **one urinary system conflict** (e.g., kidney, renal pelvis, ureters, bladder) in the options — even if not among the top matches.
⚠️ If the symptoms are vague, internal, or ambiguous and do not clearly point to a unique cause, you MUST include at least 3–4 reasonable options from different tissues or systems — not just one or two.
⚠️ IMPORTANT: Your response must be clean JSON, with no markdown, no emojis, and no external explanations. ONLY the JSON object.
`,
de:
`
Deine Antwort muss vollständig in professionellem, klarem und natürlichem Deutsch verfasst sein. Verwende keine andere Sprache.

Handle als professioneller Therapeut der Germanischen Heilkunde. Du hast Zugriff auf eine strukturierte Datenbank biologischer Konflikte.

Analysiere die Symptome, das Geschlecht, das Alter und den sozialen Kontext des Patienten, um den wahrscheinlichsten Konflikt bzw. die wahrscheinlichsten Konflikte gemäß der biologischen Logik zu bestimmen.

Wenn mehrere Konflikte mit ähnlichen Symptomen möglich sind, biete bis zu 4 klar unterscheidbare Optionen zur Auswahl an.

Wenn es eine klare Übereinstimmung gibt, erkläre diesen Konflikt im Detail.

Wenn die Symptome zu allgemein sind, erstelle Auswahloptionen für den Benutzer.

Erfinde niemals Informationen und sage nicht "Gewebe nicht spezifiziert". Wenn die Information nicht in der Datenbank vorhanden ist, schreibe: "Nicht in dieser Datenbank registriert."


--- PATIENTENDATEN ---
${JSON.stringify(body)}

--- DATENBANK DER GERMANISCHEN HEILKUNDE ---
${JSON.stringify(base).slice(0, 15000)}...

--- ERWARTETES FORMAT ---
Bei eindeutiger Übereinstimmung:
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

Bei mehreren möglichen Konflikten:
{
  "tipo": "optionen": [
    {
      "conflicto": "Name des Konflikts",
      "organo_tejido": "Betroffenes Organ oder Gewebe",
      "tejido_embrionario": "Embryonales Gewebe",
      "contexto_social": ["Häufige Situationen, die den Konflikt auslösen"],
      "tipos_personalidad": ["Besonders gefährdete Persönlichkeitsprofile"]
    }
  ]
}
⚠️ IMPORTANT : Ta réponse doit être un JSON propre, sans markdown, sans emojis, sans explication externe. UNIQUEMENT l'objet JSON.
`,
it: 
`
La tua risposta deve essere scritta completamente in italiano professionale, chiaro e naturale. Non usare nessun'altra lingua.

Agisci come un terapeuta professionista di Medicina Germanica. Hai accesso a un database strutturato con conflitti biologici.

Analizza i sintomi, il sesso, l’età e il contesto sociale del paziente per determinare quali conflitti siano più probabili secondo la logica biologica.

Se ci sono diversi conflitti possibili con sintomi simili, proponi fino a 4 opzioni chiaramente distinte per far scegliere l’utente.

Se c’è una corrispondenza chiara, spiega in dettaglio quel conflitto.

Se i sintomi sono troppo generici, genera opzioni selezionabili.

Non inventare mai informazioni e non dire "tessuto non specificato". Se il dato manca, scrivi: "Non registrato in questo database."



--- DATI DEL PAZIENTE ---
${JSON.stringify(body)}

--- DATABASE DI MEDICINA GERMANICA ---
${JSON.stringify(base).slice(0, 15000)}...

--- FORMATO ATTESO ---
Se c’è una corrispondenza chiara:
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
Se ci sono più conflitti possibili:
{
  "tipo": "opzioni": [
    {
      "conflicto": "Nome del conflitto",
      "organo_tejido": "Organo o tessuto coinvolto",
      "tejido_embrionario": "Tessuto embrionale",
      "contexto_social": ["Situazioni comuni che attivano il conflitto"],
      "tipos_personalidad": ["Profili di personalità più vulnerabili"]
    }
  ]
}
⚠️ IMPORTANTE: La tua risposta deve essere un JSON pulito, senza markdown, senza emoji, senza spiegazioni. SOLO l’oggetto JSON.
`,
pt:
`
Sua resposta deve ser completamente escrita em português profissional, claro e natural. Não use nenhum outro idioma.

Atue como um terapeuta profissional de Medicina Germânica. Você tem acesso a um banco de dados estruturado com conflitos biológicos.

Analise os sintomas, sexo, idade e contexto social do paciente para determinar quais conflitos são mais prováveis segundo a lógica biológica.

Se houver vários conflitos possíveis com sintomas semelhantes, ofereça até 4 opções bem diferenciadas para o usuário escolher.

Se houver uma correspondência clara, explique esse conflito em detalhes.

Se os sintomas forem muito genéricos, gere opções para o usuário escolher.

Nunca invente informações nem diga "tecido não especificado". Se o dado não estiver na base, diga: "Não registrado neste banco de dados."



--- DADOS DO PACIENTE ---
${JSON.stringify(body)}

--- BANCO DE DADOS DE MEDICINA GERMÂNICA ---
${JSON.stringify(base).slice(0, 15000)}...

--- FORMATO ESPERADO ---
Se houver uma correspondência clara:
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
Se houver múltiplos conflitos possíveis:
{
  "tipo": "opções": [
    {
      "conflicto": "Nome do conflito",
      "organo_tejido": "Órgão ou tecido envolvido",
      "tejido_embrionario": "Tecido embrionário",
      "contexto_social": ["Situações comuns que ativam o conflito"],
      "tipos_personalidad": ["Perfis de personalidade mais vulneráveis"]
    }
  ]
}
⚠️ IMPORTANTE: Sua resposta deve ser um JSON limpo, sem markdown, sem emojis, sem explicações externas. SOMENTE o objeto JSON.
`,
fr:
`
Ta réponse doit être entièrement rédigée en français professionnel, clair et naturel. N'utilise aucune autre langue.

Agis comme un thérapeute professionnel en Médecine Germanique. Tu as accès à une base de données structurée de conflits biologiques.

Analyse les symptômes, le sexe, l’âge et le contexte social du patient pour identifier les conflits les plus probables selon la logique biologique.

S’il existe plusieurs conflits possibles aux symptômes similaires, propose jusqu’à 4 options bien différenciées pour que l’utilisateur choisisse.

S’il y a une correspondance claire, explique ce conflit en détail.

Si les symptômes sont trop généraux, génère plusieurs options à choisir.

Ne jamais inventer d'information ni dire "tissu non spécifié". Si la donnée est absente, indique : "Non enregistré dans cette base de données."



--- DONNÉES DU PATIENT ---
${JSON.stringify(body)}

--- BASE DE DONNÉES DE MÉDECINE GERMANIQUE ---
${JSON.stringify(base).slice(0, 15000)}...

--- FORMAT ATTENDU ---
En cas de correspondance claire :
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
En cas de conflits multiples :
{
  "tipo": "options": [
    {
      "conflicto": "Nom du conflit",
      "organo_tejido": "Organe ou tissu concerné",
      "tejido_embrionario": "Tissu embryonnaire",
      "contexto_social": ["Situations courantes déclenchant le conflit"],
      "tipos_personalidad": ["Profils de personnalité les plus vulnérables"]
    }
  ]
}
⚠️ IMPORTANTE: La tua risposta deve essere un JSON pulito, senza markdown, senza emoji, senza spiegazioni. SOLO l’oggetto JSON.
`,
ru:
`
Твой ответ должен быть полностью написан на профессиональном, ясном и естественном русском языке. Не используй другие языки.

Действуй как профессиональный терапевт Германской медицины. У тебя есть доступ к структурированной базе данных биологических конфликтов.

Проанализируй симптомы, пол, возраст и социальный контекст пациента, чтобы определить наиболее вероятные конфликты на основе биологической логики.

Если есть несколько возможных конфликтов с похожими симптомами, предложи до 4 чётко различающихся вариантов, чтобы пользователь выбрал.

Если есть однозначное совпадение, подробно объясни этот конфликт.

Если симптомы слишком общие, сгенерируй набор возможных вариантов для выбора.

Никогда не выдумывай информацию и не говори "ткань не указана". Если данные отсутствуют, напиши: "Не зарегистрировано в этой базе данных."


--- ДАННЫЕ ПАЦИЕНТА ---
${JSON.stringify(body)}

--- БАЗА ДАННЫХ ГЕРМАНСКОЙ МЕДИЦИНЫ ---
${JSON.stringify(base).slice(0, 15000)}...

--- ОЖИДАЕМЫЙ ФОРМАТ ---
Если есть чёткое совпадение:
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
Если есть несколько возможных конфликтов:
{
  "tipo": "варианты": [
    {
      "conflicto": "Название конфликта",
      "organo_tejido": "Орган или ткань",
      "tejido_embrionario": "Эмбриональная ткань",
      "contexto_social": ["Типичные ситуации, вызывающие конфликт"],
      "tipos_personalidad": ["Наиболее уязвимые типы личности"]
    }
  ]
}
⚠️ ВАЖНО: Ответ должен быть в виде чистого JSON-объекта, без markdown, без эмодзи, без пояснений. ТОЛЬКО JSON-объект.
`
}  

  const prompt = prompts_anlz[lang] || prompts_anlz['es']
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt}],
    temperature: 0.7
  })

  const raw = completion.choices[0].message.content

  // 👁️ Para depurar si falla
  console.log('IDIOMA DETECTADO FINAL:', lang)
  console.log('PROMPT ENVIADO (inicio):', prompt.slice(0, 300))
  console.log('Respuesta IA:', raw)
  console.log("Conflictos seleccionados:", conflictos.map(c => c["Órgano o Sistema"]));
  console.log("Usando IA para analizar síntomas directamente...", analizarConIA)
  
  try {
  const rawClean = raw!.replace(/```json|```/g, '').trim()
const json = JSON.parse(rawClean)
  console.log('💡 IA detectó opciones:', json)
  return NextResponse.json(json)
} catch (err) {
  console.error('❌ Error parseando respuesta IA:', err)
  const resultadosIA = await analizarConIA(sintomas, lang)
  if (resultadosIA) {
    console.warn('🔄 Usando fallback de analizarConIA por fallo de parseo.')
    return NextResponse.json(resultadosIA)
  }
  return NextResponse.json({ error: 'Respuesta no válida de la IA', raw })
}
}

