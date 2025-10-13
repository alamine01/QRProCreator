import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, createDocument } from '@/lib/firebase';
import { getAllLocalDocuments, saveLocalDocument } from '@/lib/localStorage';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateQRCode } from '@/lib/qrcode';

// GET /api/admin/documents - Récupérer tous les documents
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET documents ===');
    
    // Essayer Firebase d'abord
    try {
      const firebaseDocuments = await getAllDocuments();
      console.log('Documents Firebase récupérés:', firebaseDocuments.length);
      
      // Ajouter les documents locaux
      const localDocuments = getAllLocalDocuments();
      console.log('Documents locaux récupérés:', localDocuments.length);
      
      const allDocuments = [...firebaseDocuments, ...localDocuments];
      return NextResponse.json(allDocuments);
    } catch (firebaseError) {
      console.error('Erreur Firebase, utilisation du stockage local:', firebaseError);
      const localDocuments = getAllLocalDocuments();
      return NextResponse.json(localDocuments);
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/documents - Créer un document (métadonnées seulement)
export async function POST(request: NextRequest) {
  try {
    console.log('=== Début création document ===');

    const documentData = await request.json();
    console.log('Données reçues:', JSON.stringify(documentData, null, 2));

    // Validation des champs requis
    if (!documentData.name) {
      console.log('❌ Erreur: Nom manquant');
      return NextResponse.json({ error: 'Le nom du document est requis' }, { status: 400 });
    }

    if (!documentData.filePath) {
      console.log('❌ Erreur: filePath manquant');
      return NextResponse.json({ error: 'Le chemin du fichier est requis' }, { status: 400 });
    }

    // publicUrl n'est plus requis ici car il est généré après la création du document dans Firestore
    // if (!documentData.publicUrl) {
    //   console.log('❌ Erreur: publicUrl manquant');
    //   return NextResponse.json({ error: 'L\'URL publique est requise' }, { status: 400 });
    // }

    // Essayer Firebase d'abord
    console.log('💾 Tentative de sauvegarde Firebase...');
    try {
      const docId = await createDocument(documentData);
      console.log('✅ Document Firebase créé avec ID:', docId);

      // Générer l'URL publique avec l'ID Firebase réel
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'; // Utiliser le port 3002
      const correctPublicUrl = `${baseUrl}/api/document/${docId}`; // Changed to /api/document/
      
      const createdDocument = {
        id: docId,
        ...documentData,
        publicUrl: correctPublicUrl, // Utiliser l'URL avec l'ID Firebase réel
        downloadCount: 0,
        qrScanCount: 0,
        isActive: true,
        uploadedAt: new Date().toISOString()
      };

      console.log('=== Document créé avec succès dans Firebase ===');
      return NextResponse.json(createdDocument);
    } catch (firebaseError) {
      console.error('❌ Erreur Firebase:', firebaseError);
      console.log('🔄 Fallback: sauvegarde locale...');
      
      // Fallback: sauvegarde locale
      try {
        const localDocument = saveLocalDocument(documentData);
        console.log('✅ Document sauvegardé localement:', localDocument.id);
        return NextResponse.json(localDocument);
      } catch (localError) {
        console.error('❌ Erreur sauvegarde locale:', localError);
        return NextResponse.json({
          error: 'Impossible de sauvegarder le document',
          details: localError instanceof Error ? localError.message : 'Unknown error'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('=== Erreur lors de la création ===', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}