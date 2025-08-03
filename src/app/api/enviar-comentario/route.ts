import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const mensaje = body.mensaje || ''
    const registro = body.registro || {}

    const nombre = registro?.nombre || 'No especificado'
    const apellido = registro?.apellido || ''
    const email = registro?.correo || 'No especificado'
    const celular = registro?.celular || 'No especificado'
    const sintomas = (registro?.sintomas || []).join(', ')
    const antecedentes = (registro?.antecedentes || []).join(', ')
    const diagnosticos = (registro?.diagnosticos || []).join(', ')
    const fecha_nacimiento = registro?.fecha_nacimiento || 'No especificado'
    const sexo = registro?.sexo || 'No especificado'

    const contenidoHTML = `
      <h2>📩 Nuevo comentario o reporte de error</h2>
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

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['astromind66@gmail.com'],
      subject: '📨 Comentario o error reportado desde MG-AI',
      html: contenidoHTML
    })

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('Error enviando email:', err)
    return NextResponse.json({ status: 'error', message: 'Falló el envío del email' }, { status: 500 })
  }
}
``
