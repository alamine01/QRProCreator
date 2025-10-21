import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, increment, addDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Récupérer les informations de la requête
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'Unknown';
    
    console.log(`💾 Nouveau téléchargement pour document: ${id}`);
    console.log(`🌐 User Agent: ${userAgent}`);
    console.log(`📍 IP: ${ip}`);

    // Vérifier que le document existe
    const documentRef = doc(db, 'documents', id);
    const documentSnap = await getDoc(documentRef);
    
    if (!documentSnap.exists()) {
      console.log(`❌ Document ${id} non trouvé`);
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    const documentData = documentSnap.data();
    
    // Vérifier que le document est public et que le tracking est activé
    if (documentData.classification !== 'public' || !documentData.statsTrackingEnabled) {
      console.log(`❌ Tracking non autorisé pour document ${id}`);
      return NextResponse.json({ error: 'Tracking non autorisé pour ce document' }, { status: 403 });
    }

    // Incrémenter le compteur de téléchargements
    try {
      await updateDoc(doc(db, 'documents', id), {
        downloadCount: increment(1)
      });
      console.log('✅ Compteur de téléchargements incrémenté');
    } catch (updateError) {
      console.log('⚠️ Erreur lors de l\'incrémentation du compteur:', updateError);
      // Continuer même si l'incrémentation échoue
    }

    // Enregistrer le téléchargement dans la collection documentDownloads
    const downloadData = {
      documentId: id,
      timestamp: serverTimestamp(),
      userAgent: userAgent,
      ip: ip,
      location: null // Peut être enrichi plus tard avec des services de géolocalisation
    };

    const downloadRef = await addDoc(collection(db, 'documentDownloads'), downloadData);
    
    console.log(`✅ Téléchargement enregistré avec ID: ${downloadRef.id}`);
    console.log(`📊 Nouveau total de téléchargements: ${(documentData.downloadCount || 0) + 1}`);

    return NextResponse.json({ 
      success: true, 
      downloadId: downloadRef.id,
      newCount: (documentData.downloadCount || 0) + 1
    });

  } catch (error) {
    console.error('❌ Erreur lors du tracking du téléchargement:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'enregistrement du téléchargement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Méthode GET pour permettre les téléchargements depuis des applications mobiles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Récupérer les informations de la requête
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'Unknown';
    
    console.log(`💾 Téléchargement GET pour document: ${id}`);

    // Vérifier que le document existe
    const documentRef = doc(db, 'documents', id);
    const documentSnap = await getDoc(documentRef);
    
    if (!documentSnap.exists()) {
      console.log(`❌ Document ${id} non trouvé`);
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    const documentData = documentSnap.data();
    
    // Vérifier que le document est public et que le tracking est activé
    if (documentData.classification !== 'public' || !documentData.statsTrackingEnabled) {
      console.log(`❌ Tracking non autorisé pour document ${id}`);
      return NextResponse.json({ error: 'Tracking non autorisé pour ce document' }, { status: 403 });
    }

    // Incrémenter le compteur de téléchargements
    try {
      await updateDoc(doc(db, 'documents', id), {
        downloadCount: increment(1)
      });
      console.log('✅ Compteur de téléchargements incrémenté (GET)');
    } catch (updateError) {
      console.log('⚠️ Erreur lors de l\'incrémentation du compteur (GET):', updateError);
      // Continuer même si l'incrémentation échoue
    }

    // Enregistrer le téléchargement dans la collection documentDownloads
    const downloadData = {
      documentId: id,
      timestamp: serverTimestamp(),
      userAgent: userAgent,
      ip: ip,
      location: null
    };

    const downloadRef = await addDoc(collection(db, 'documentDownloads'), downloadData);
    
    console.log(`✅ Téléchargement GET enregistré avec ID: ${downloadRef.id}`);

    return NextResponse.json({ 
      success: true, 
      downloadId: downloadRef.id,
      newCount: (documentData.downloadCount || 0) + 1
    });

  } catch (error) {
    console.error('❌ Erreur lors du tracking du téléchargement GET:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'enregistrement du téléchargement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
