import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, incrementDownloadCount } from '@/lib/firebase';

// GET /api/document/[id] - Accès public à un document
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
    
    if (!document.isActive) {
      return NextResponse.json({ error: 'Document non disponible' }, { status: 403 });
    }
    
    // Incrémenter le compteur de téléchargement
    try {
      await incrementDownloadCount(id);
    } catch (countError) {
      console.error('Erreur lors de l\'incrémentation du compteur:', countError);
      // Continuer même si l'incrémentation échoue
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
