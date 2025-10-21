import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les utilisateurs
    const usersCollection = collection(db, 'users');
    
    // Essayer d'abord avec orderBy, sinon sans
    let querySnapshot;
    try {
      const q = query(usersCollection, orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (orderByError) {
      // Si orderBy échoue, récupérer sans tri
      querySnapshot = await getDocs(usersCollection);
    }
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}