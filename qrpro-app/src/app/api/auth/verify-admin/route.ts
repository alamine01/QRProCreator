import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔒 [SECURITY API] Début de la vérification admin');
    const { userId, email } = await request.json();
    
    // Logs de sécurité
    console.log('🔒 [SECURITY API] Vérification admin:', {
      userId,
      email,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    // Vérifications de base
    if (!userId || !email) {
      console.log('🚫 [SECURITY API] Données manquantes');
      return NextResponse.json(
        { error: 'Données manquantes', isValid: false },
        { status: 400 }
      );
    }

    // Vérification de l'origine de la requête - SÉCURISÉE
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://qrprocreator.com',
      'https://www.qrprocreator.com'
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      console.log('🚫 [SECURITY API] Origine non autorisée:', origin);
      return NextResponse.json(
        { error: 'Origine non autorisée', isValid: false },
        { status: 403 }
      );
    }
    
    if (!origin && !referer) {
      console.log('🚫 [SECURITY API] Requête suspecte - Pas d\'origine');
      return NextResponse.json(
        { error: 'Requête suspecte', isValid: false },
        { status: 403 }
      );
    }

    // Vérification admin via Firebase - Récupérer le profil utilisateur
    try {
      const userProfile = await getUserProfile(userId);
      
      if (!userProfile) {
        console.log('🚫 [SECURITY API] Profil utilisateur non trouvé:', userId);
        return NextResponse.json(
          { error: 'Profil utilisateur non trouvé', isValid: false },
          { status: 404 }
        );
      }

      // Vérifier si l'utilisateur est admin
      if (!userProfile.isAdmin) {
        console.log('🚫 [SECURITY API] Utilisateur non admin:', {
          userId,
          email,
          isAdmin: userProfile.isAdmin
        });
        return NextResponse.json(
          { error: 'Accès non autorisé - Pas de droits admin', isValid: false },
          { status: 403 }
        );
      }

      console.log('✅ [SECURITY API] Vérification admin réussie:', {
        userId,
        email,
        isAdmin: userProfile.isAdmin,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName
      });

      return NextResponse.json({
        isValid: true,
        isAdmin: true,
        isSuperAdmin: false, // Pour l'instant, pas de super admin
        user: {
          id: userId,
          email: email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          isAdmin: userProfile.isAdmin
        }
      });

    } catch (firebaseError) {
      console.error('❌ [SECURITY API] Erreur Firebase:', firebaseError);
      
      // Fallback temporaire pour les emails admin connus
      const authorizedAdmins = [
        'admin@qrprocreator.com',
        'contact@qrprocreator.com'
      ];
      
      if (authorizedAdmins.includes(email)) {
        console.log('✅ [SECURITY API] Fallback admin autorisé:', email);
        return NextResponse.json({
          isValid: true,
          isAdmin: true,
          isSuperAdmin: false,
          user: {
            id: userId,
            email: email,
            firstName: 'Admin',
            lastName: 'User'
          }
        });
      }
      
      return NextResponse.json(
        { error: 'Erreur de vérification Firebase', isValid: false },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ [SECURITY API] Erreur de vérification:', error);
    return NextResponse.json(
      { error: 'Erreur interne', isValid: false },
      { status: 500 }
    );
  }
}
