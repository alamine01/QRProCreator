import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Récupération de tous les documents pour admin');
    
    // Récupérer tous les documents depuis Firestore
    const documentsQuery = query(
      collection(db, 'documents'),
      orderBy('uploadedAt', 'desc')
    );
    
    const documentsSnapshot = await getDocs(documentsQuery);
    const documents = documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📋 ${documents.length} documents trouvés`);
    
    return NextResponse.json(documents);
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des documents:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}