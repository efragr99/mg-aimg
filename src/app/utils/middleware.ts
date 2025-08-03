// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // Limitar solo en endpoints de IA
  const limitarEn = ['/api/analizar', '/api/desarrollar']
  if (limitarEn.includes(url.pathname)) {
    const visitas = parseInt(request.cookies.get('mgai-visitas')?.value || '0')

    if (visitas >= 1) {
      // Redirige a la pantalla Premium (o puedes devolver un JSON también)
      url.pathname = '/trabajando'
      return NextResponse.redirect(url)
    }

    const response = NextResponse.next()
    response.cookies.set('mgai-visitas', (visitas + 1).toString(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 días
    })

    return response
  }

  return NextResponse.next()
}

