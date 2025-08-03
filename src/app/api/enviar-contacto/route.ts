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

    const data = await resend.emails.send({
      from: 'MG-AI Contact <onboarding@resend.dev>',
      to: ['astromind66@gmail.com'],
      subject: 'Nuevo contacto desde la app MG-AI',
      html: contenido
    })

    return NextResponse.json({ status: 'ok', data })
  } catch (err) {
    console.error('❌ Error enviando correo:', err)
    return NextResponse.json({ status: 'error', message: 'Fallo en el servidor' }, { status: 500 })
  }
}
