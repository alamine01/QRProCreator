import { NextRequest, NextResponse } from 'next/server';

// Version simplifiée pour tester
export async function POST(request: NextRequest) {
  try {
    console.log('=== Test upload document ===');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    console.log('Données reçues:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      name, 
      description 
    });

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Le nom du document est requis' }, { status: 400 });
    }

    // Vérifier la taille du fichier (20MB max)
    const maxSize = 20 * 1024 * 1024; // 20MB en bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Le fichier est trop volumineux. Taille maximale autorisée: 20MB' 
      }, { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté. Types autorisés: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP, TXT, XLS, XLSX' 
      }, { status: 400 });
    }

    // Pour l'instant, retournons juste les infos du fichier sans upload
    const mockDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: `documents/${file.name}`,
      publicUrl: `http://localhost:3000/document/doc_${Date.now()}`,
      qrCodePath: '',
      uploadedBy: 'admin',
      uploadedAt: new Date(),
      isActive: true,
      downloadCount: 0,
      description: description || '',
      mimeType: file.type
    };

    console.log('=== Test réussi ===');
    return NextResponse.json(mockDocument);
    
  } catch (error) {
    console.error('=== Erreur lors du test ===', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET pour tester
export async function GET(request: NextRequest) {
  try {
    console.log('=== Test GET documents ===');
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
