import { NextRequest, NextResponse } from 'next/server';
import { updateDocument, deleteDocument, getDocumentById } from '@/lib/firebase';
import { deleteLocalDocument, getAllLocalDocuments } from '@/lib/localStorage';
import { storage } from '@/lib/firebase';
import { ref, deleteObject } from 'firebase/storage';

// GET /api/admin/documents/[id] - Récupérer un document spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await getDocumentById(id);
    
    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/documents/[id] - Mettre à jour un document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updatedDocument = await updateDocument(id, data);
    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/documents/[id] - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Suppression du document:', id);
    
    // Essayer Firebase d'abord
    try {
      // Récupérer le document avant suppression pour obtenir le chemin du fichier
      const document = await getDocumentById(id);
      if (!document) {
        return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
      }
      
      // Supprimer le fichier du Storage
      try {
        const fileRef = ref(storage, document.filePath);
        await deleteObject(fileRef);
        console.log('✅ Fichier Storage supprimé');
      } catch (storageError) {
        console.error('Erreur lors de la suppression du fichier du Storage:', storageError);
        // Continuer même si la suppression du fichier échoue
      }
      
      // Supprimer le QR code du Storage s'il existe
      if (document.qrCodePath) {
        try {
          const qrCodeRef = ref(storage, `qr-codes/documents/${id}.png`);
          await deleteObject(qrCodeRef);
          console.log('✅ QR code Storage supprimé');
        } catch (qrError) {
          console.error('Erreur lors de la suppression du QR code:', qrError);
          // Continuer même si la suppression du QR code échoue
        }
      }
      
      // Supprimer l'enregistrement de Firestore
      await deleteDocument(id);
      console.log('✅ Document Firebase supprimé');
      
      return NextResponse.json({ message: 'Document supprimé avec succès' });
    } catch (firebaseError) {
      console.error('❌ Erreur Firebase, tentative de suppression locale:', firebaseError);
      
      // Fallback: suppression locale
      const success = deleteLocalDocument(id);
      if (success) {
        console.log('✅ Document local supprimé');
        return NextResponse.json({ message: 'Document supprimé avec succès (local)' });
      } else {
        return NextResponse.json({ error: 'Impossible de supprimer le document' }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
