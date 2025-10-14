import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Logs de sécurité
  console.log('🔒 [SECURITY] Tentative d\'accès:', {
    path: pathname,
    method: request.method,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // Rediriger /document/[id] vers /api/document/[id]
  if (pathname.startsWith('/document/') && pathname !== '/document') {
    const documentId = pathname.split('/document/')[1];
    if (documentId) {
      const apiUrl = new URL(`/api/document/${documentId}`, request.url);
      return NextResponse.redirect(apiUrl);
    }
  }

  // Protection des routes admin
  if (pathname.startsWith('/admin')) {
    // Vérifier la présence du token d'authentification
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      console.log('🚫 [SECURITY] Accès refusé - Pas de token d\'authentification');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Vérifier les headers de sécurité
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      console.log('🚫 [SECURITY] Accès refusé - User-Agent suspect');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Protection des API admin
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      console.log('🚫 [SECURITY] API Admin - Accès refusé - Pas de token');
      return NextResponse.json(
        { error: 'Non autorisé', code: 'UNAUTHORIZED' }, 
        { status: 401 }
      );
    }

    // Vérifier l'origine de la requête
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    if (!origin && !referer) {
      console.log('🚫 [SECURITY] API Admin - Accès refusé - Pas d\'origine');
      return NextResponse.json(
        { error: 'Requête suspecte', code: 'SUSPICIOUS_REQUEST' }, 
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/document/:path*',
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
