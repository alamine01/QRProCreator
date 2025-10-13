import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, incrementDownloadCount } from '@/lib/firebase';
import { getAllLocalDocuments } from '@/lib/localStorage';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// GET /api/document/[id] - Accès public à un document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 Recherche du document avec ID:', id);
    
    // Vérifier si c'est un document temporaire (fallback)
    if (id.startsWith('fallback_')) {
      console.log('📄 Document temporaire détecté');
      return NextResponse.json({ 
        error: 'Document temporaire non disponible',
        details: 'Ce document a été créé en mode temporaire et n\'est pas accessible publiquement'
      }, { status: 404 });
    }
    
    // Essayer Firebase d'abord
    try {
      const document = await getDocumentById(id);
      console.log('📄 Document Firebase trouvé:', document ? 'Oui' : 'Non');
      
      if (document && document.isActive) {
        console.log('✅ Document Firebase valide trouvé:', document.name);
        
        // Incrémenter le compteur de téléchargement
        try {
          await incrementDownloadCount(id);
          console.log('📊 Compteur de téléchargement incrémenté');
        } catch (countError) {
          console.error('❌ Erreur lors de l\'incrémentation du compteur:', countError);
        }
        
        // Rediriger directement vers le fichier
        let directUrl;
        if (document.filePath) {
          try {
            // Obtenir l'URL de téléchargement Firebase Storage
            const storage = getStorage();
            const fileRef = ref(storage, document.filePath);
            directUrl = await getDownloadURL(fileRef);
            console.log('✅ URL Firebase Storage obtenue:', directUrl);
          } catch (storageError) {
            console.error('❌ Erreur Firebase Storage:', storageError);
            directUrl = document.publicUrl;
          }
        } else {
          directUrl = document.publicUrl;
        }
        
        return NextResponse.redirect(directUrl);
      }
    } catch (firebaseError) {
      console.error('❌ Erreur Firebase, recherche locale:', firebaseError);
    }
    
    // Fallback: chercher dans les documents locaux
    console.log('🔍 Recherche dans les documents locaux...');
    const localDocuments = getAllLocalDocuments();
    const localDocument = localDocuments.find(doc => doc.id === id);
    
    if (localDocument && localDocument.isActive) {
      console.log('✅ Document local trouvé:', localDocument.name);
      // Rediriger directement vers le fichier
      let directUrl;
      if (localDocument.filePath) {
        try {
          // Obtenir l'URL de téléchargement Firebase Storage
          const storage = getStorage();
          const fileRef = ref(storage, localDocument.filePath);
          directUrl = await getDownloadURL(fileRef);
          console.log('✅ URL Firebase Storage obtenue (local):', directUrl);
        } catch (storageError) {
          console.error('❌ Erreur Firebase Storage (local):', storageError);
          directUrl = localDocument.publicUrl;
        }
      } else {
        directUrl = localDocument.publicUrl;
      }
      
      return NextResponse.redirect(directUrl);
    }
    
    console.log('❌ Document non trouvé pour ID:', id);
    return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    
  } catch (error) {
    console.error('❌ Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
