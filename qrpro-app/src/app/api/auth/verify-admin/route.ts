import { NextRequest, NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔒 [SECURITY API] Début de la vérification admin');
    const { userId, email } = await request.json();
    
    // Logs de sécurité
    console.log('🔒 [SECURITY API] Vérification admin:', {
      userId,
      email,
      ip: request.ip || request.headers.get('x-forwarded-for'),
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

    // Vérifier l'origine de la requête
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    if (!origin && !referer) {
      console.log('🚫 [SECURITY API] Requête suspecte - Pas d\'origine');
      return NextResponse.json(
        { error: 'Requête suspecte', isValid: false },
        { status: 403 }
      );
    }

    // Récupérer l'utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.log('🚫 [SECURITY API] Utilisateur non trouvé:', userId);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé', isValid: false },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Vérifier l'email
    if (userData.email !== email) {
      console.log('🚫 [SECURITY API] Email ne correspond pas:', {
        provided: email,
        stored: userData.email
      });
      return NextResponse.json(
        { error: 'Email invalide', isValid: false },
        { status: 403 }
      );
    }

    // Vérifier les permissions admin
    if (!userData.isAdmin) {
      console.log('🚫 [SECURITY API] Pas de droits admin:', {
        userId,
        email,
        isAdmin: userData.isAdmin
      });
      return NextResponse.json(
        { error: 'Droits insuffisants', isValid: false, isAdmin: false },
        { status: 403 }
      );
    }

    // Vérifier si le compte est actif
    if (userData.isBlocked || userData.isSuspended) {
      console.log('🚫 [SECURITY API] Compte bloqué/suspendu:', {
        userId,
        email,
        isBlocked: userData.isBlocked,
        isSuspended: userData.isSuspended
      });
      return NextResponse.json(
        { error: 'Compte bloqué', isValid: false, isAdmin: false },
        { status: 403 }
      );
    }

    // Vérifier la dernière activité (optionnel)
    const lastActivity = userData.lastActivity?.toDate();
    const now = new Date();
    const daysSinceActivity = lastActivity ? (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24) : 0;
    
    if (daysSinceActivity > 30) { // 30 jours d'inactivité
      console.log('⚠️ [SECURITY API] Compte inactif:', {
        userId,
        email,
        daysSinceActivity
      });
    }

    console.log('✅ [SECURITY API] Vérification réussie:', {
      userId,
      email,
      isAdmin: userData.isAdmin,
      isSuperAdmin: userData.isSuperAdmin || false
    });

    return NextResponse.json({
      isValid: true,
      isAdmin: userData.isAdmin,
      isSuperAdmin: userData.isSuperAdmin || false,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    });

  } catch (error) {
    console.error('❌ [SECURITY API] Erreur de vérification:', error);
    return NextResponse.json(
      { error: 'Erreur interne', isValid: false },
      { status: 500 }
    );
  }
}
