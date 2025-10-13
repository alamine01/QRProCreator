import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, createDocument } from '@/lib/firebase';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateQRCode } from '@/lib/qrcode';

// GET /api/admin/documents - Récupérer tous les documents
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET documents ===');
    const documents = await getAllDocuments();
    console.log('Documents Firestore récupérés:', documents.length);
    return NextResponse.json(documents);
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
    console.log('Données reçues:', documentData);

    if (!documentData.name) {
      console.log('Erreur: Nom manquant');
      return NextResponse.json({ error: 'Le nom du document est requis' }, { status: 400 });
    }

    // Créer l'enregistrement dans Firestore
    console.log('Création enregistrement Firestore...');
    const docId = await createDocument(documentData);
    console.log('Document Firestore créé avec ID:', docId);

    // Retourner les informations du document créé
    const createdDocument = {
      id: docId,
      ...documentData,
      downloadCount: 0,
      isActive: true,
      uploadedAt: new Date().toISOString()
    };

    console.log('=== Document créé avec succès ===');
    return NextResponse.json(createdDocument);
  } catch (error) {
    console.error('=== Erreur lors de la création ===', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}