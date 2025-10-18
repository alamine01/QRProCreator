import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUserAdminStatus } from '@/lib/firebase';

// POST /api/admin/promote-by-email - Promouvoir un utilisateur en admin par email
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [PROMOTE BY EMAIL] Début de la promotion par email');
    
    // VÉRIFICATION DE SÉCURITÉ : Vérifier l'origine de la requête
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://qrprocreator.com',
      'https://www.qrprocreator.com'
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      console.log('🚫 [PROMOTE BY EMAIL] Origine non autorisée:', origin);
      return NextResponse.json(
        { error: 'Origine non autorisée' },
        { status: 403 }
      );
    }
    
    if (!origin && !referer) {
      console.log('🚫 [PROMOTE BY EMAIL] Requête suspecte - Pas d\'origine');
      return NextResponse.json(
        { error: 'Requête suspecte' },
        { status: 403 }
      );
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // VÉRIFICATION DE SÉCURITÉ : Limiter aux emails autorisés
    const authorizedEmails = [
      'admin@qrprocreator.com',
      'contact@qrprocreator.com',
      // Ajoutez votre email ici temporairement
    ];
    
    if (!authorizedEmails.includes(email)) {
      console.log('🚫 [PROMOTE BY EMAIL] Email non autorisé:', email);
      return NextResponse.json(
        { error: 'Email non autorisé pour la promotion' },
        { status: 403 }
      );
    }

    console.log('🔧 [PROMOTE BY EMAIL] Recherche de l\'utilisateur:', email);
    
    // Récupérer tous les utilisateurs pour trouver celui avec cet email
    const users = await getAllUsers();
    const targetUser = users.find(user => user.email === email);
    
    if (!targetUser) {
      console.log('❌ [PROMOTE BY EMAIL] Utilisateur non trouvé:', email);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé avec cet email' },
        { status: 404 }
      );
    }

    console.log('🔧 [PROMOTE BY EMAIL] Utilisateur trouvé:', {
      id: targetUser.id,
      email: targetUser.email,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      currentAdminStatus: targetUser.isAdmin
    });
    
    // Promouvoir l'utilisateur en admin
    await updateUserAdminStatus(targetUser.id, true);
    
    console.log('✅ [PROMOTE BY EMAIL] Utilisateur promu en admin avec succès');
    
    return NextResponse.json({
      success: true,
      message: 'Utilisateur promu en admin avec succès',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        isAdmin: true
      }
    });

  } catch (error) {
    console.error('❌ [PROMOTE BY EMAIL] Erreur lors de la promotion:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la promotion', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
