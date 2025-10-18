import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/firebase';

// GET /api/admin/diagnose-users - Diagnostiquer les utilisateurs et leurs statuts admin
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DIAGNOSTIC] Début du diagnostic des utilisateurs');
    
    // VÉRIFICATION DE SÉCURITÉ : Vérifier l'origine de la requête
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://qrprocreator.com',
      'https://www.qrprocreator.com'
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      console.log('🚫 [DIAGNOSTIC] Origine non autorisée:', origin);
      return NextResponse.json(
        { error: 'Origine non autorisée' },
        { status: 403 }
      );
    }
    
    if (!origin && !referer) {
      console.log('🚫 [DIAGNOSTIC] Requête suspecte - Pas d\'origine');
      return NextResponse.json(
        { error: 'Requête suspecte' },
        { status: 403 }
      );
    }
    
    // Récupérer tous les utilisateurs
    const users = await getAllUsers();
    
    console.log('🔍 [DIAGNOSTIC] Utilisateurs trouvés:', users.length);
    
    // Analyser les utilisateurs
    const analysis = {
      totalUsers: users.length,
      adminUsers: users.filter(user => user.isAdmin),
      regularUsers: users.filter(user => !user.isAdmin),
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        profileSlug: user.profileSlug
      }))
    };
    
    console.log('🔍 [DIAGNOSTIC] Analyse terminée:', {
      totalUsers: analysis.totalUsers,
      adminCount: analysis.adminUsers.length,
      regularCount: analysis.regularUsers.length
    });
    
    return NextResponse.json(analysis);
    
  } catch (error) {
    console.error('❌ [DIAGNOSTIC] Erreur:', error);
    return NextResponse.json({ 
      error: 'Erreur de diagnostic', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
