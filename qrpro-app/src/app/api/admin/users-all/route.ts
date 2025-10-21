import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    console.log('API GET /api/admin/users-all appelée');
    
    // Récupérer tous les utilisateurs sans tri
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    
    console.log('Nombre total de documents dans la collection users:', querySnapshot.docs.length);
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`Utilisateur ${doc.id}:`, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        isAdmin: data.isAdmin,
        createdAt: data.createdAt,
        profileSlug: data.profileSlug
      });
      
      return {
        id: doc.id,
        ...data
      };
    });
    
    console.log('Total utilisateurs récupérés (sans tri):', users.length);
    console.log('Emails des utilisateurs:', users.map(u => (u as any).email));
    
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}
