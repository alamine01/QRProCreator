import { NextRequest, NextResponse } from 'next/server';

// Middleware de sécurité pour les endpoints admin
export function validateAdminRequest(request: NextRequest): NextResponse | null {
  // Vérifier l'origine de la requête
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const allowedOrigins = [
    'http://localhost:3000',
    'https://qrprocreator.com',
    'https://www.qrprocreator.com'
  ];
  
  if (origin && !allowedOrigins.includes(origin)) {
    console.log('🚫 [SECURITY] Origine non autorisée:', origin);
    return NextResponse.json(
      { error: 'Origine non autorisée' },
      { status: 403 }
    );
  }
  
  if (!origin && !referer) {
    console.log('🚫 [SECURITY] Requête suspecte - Pas d\'origine');
    return NextResponse.json(
      { error: 'Requête suspecte' },
      { status: 403 }
    );
  }

  // Vérifier le User-Agent pour détecter les bots
  const userAgent = request.headers.get('user-agent');
  if (!userAgent || userAgent.length < 10) {
    console.log('🚫 [SECURITY] User-Agent suspect:', userAgent);
    return NextResponse.json(
      { error: 'User-Agent invalide' },
      { status: 403 }
    );
  }

  // Vérifier la méthode HTTP
  const method = request.method;
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
    console.log('🚫 [SECURITY] Méthode HTTP non autorisée:', method);
    return NextResponse.json(
      { error: 'Méthode HTTP non autorisée' },
      { status: 405 }
    );
  }

  return null; // Requête valide
}

// Fonction pour valider les emails autorisés
export function validateAuthorizedEmail(email: string): boolean {
  const authorizedEmails = [
    'admin@qrprocreator.com',
    'contact@qrprocreator.com',
    // Ajoutez votre email ici temporairement
  ];
  
  return authorizedEmails.includes(email);
}
