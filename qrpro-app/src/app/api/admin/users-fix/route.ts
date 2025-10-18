import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/firebase';

// GET /api/admin/users-fix - Get all users (Firebase only)
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [API ADMIN USERS-FIX] Récupération des données Firebase');
    
    // Utiliser uniquement Firebase
    const firebaseUsers = await getAllUsers();
    console.log('✅ [API ADMIN USERS-FIX] Données Firebase récupérées:', firebaseUsers.length);
    
    return NextResponse.json(firebaseUsers);
    
  } catch (error) {
    console.error('❌ [API ADMIN USERS-FIX] Erreur:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des utilisateurs', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// PUT /api/admin/users-fix - Update user admin status (Firebase only)
export async function PUT(request: NextRequest) {
  try {
    console.log('🚀 [API ADMIN USERS-FIX] Début de la mise à jour');
    const data = await request.json();
    console.log('🚀 [API ADMIN USERS-FIX] Données reçues:', data);
    
    // Vérification de sécurité basique
    if (!data.id || typeof data.isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'ID utilisateur et statut admin requis' },
        { status: 400 }
      );
    }

    // Utiliser uniquement Firebase
    console.log('🔥 [API ADMIN USERS-FIX] Mise à jour Firebase');
    
    // Import dynamique pour éviter les problèmes de dépendances circulaires
    const { updateUserAdminStatus } = await import('@/lib/firebase');
    await updateUserAdminStatus(data.id, data.isAdmin);
    
    console.log('✅ [API ADMIN USERS-FIX] Mise à jour Firebase réussie');
    
    return NextResponse.json({
      success: true,
      message: `Statut admin mis à jour avec succès`,
      source: 'firebase'
    });
    
  } catch (error) {
    console.error('❌ [API ADMIN USERS-FIX] Erreur:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour de l\'utilisateur', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}