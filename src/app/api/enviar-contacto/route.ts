import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, telefono, registro } = body

    const contenido = `
      <h2>📩 Nuevo contacto desde MG-AI</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${telefono}</p>
      <h3>🧬 Datos del registro:</h3>
      <pre>${JSON.stringify(registro, null, 2)}</pre>
    `
    const mensaje = body.mensaje || ''
    const nombre = registro?.nombre || 'No especificado'
    const apellido = registro?.apellido || ''
    const celular = registro?.celular || 'No especificado'
    const sintomas = (registro?.sintomas || []).join(', ')
    const antecedentes = (registro?.antecedentes || []).join(', ')
    const diagnosticos = (registro?.diagnosticos || []).join(', ')
    const fecha_nacimiento = registro?.fecha_nacimiento || 'No especificado'
    const sexo = registro?.sexo || 'No especificado'

    const contenidoHTML = `
      <h2>📩 Usuario petición de contactar terapeuta</h2>
      <p><strong>Mensaje:</strong> ${mensaje}</p>
      <hr/>
      <h3>🧑 Datos del usuario</h3>
      <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Celular:</strong> ${celular}</p>
      <p><strong>Sexo:</strong> ${sexo}</p>
      <p><strong>Fecha de nacimiento:</strong> ${fecha_nacimiento}</p>
      <p><strong>Síntomas:</strong> ${sintomas}</p>
      <p><strong>Antecedentes:</strong> ${antecedentes}</p>
      <p><strong>Diagnósticos:</strong> ${diagnosticos}</p>
    `
  
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['efragr99@gmail.com'],
      subject: 'Nuevo contacto desde la app MG-AI',
      html: contenidoHTML
    })

    return NextResponse.json({ status: 'ok', data })
  } catch (err) {
    console.error('❌ Error enviando correo:', err)
    return NextResponse.json({ status: 'error', message: 'Fallo' }, { status: 500 })
  }
}
