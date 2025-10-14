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
    
    console.log(`📱 Nouveau scan QR pour document: ${id}`);
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

    // Incrémenter le compteur de scans QR
    await updateDoc(doc(db, 'documents', id), {
      qrScanCount: increment(1)
    });

    // Enregistrer le scan dans la collection qrScans
    const scanData = {
      documentId: id,
      timestamp: serverTimestamp(),
      userAgent: userAgent,
      ip: ip,
      location: null // Peut être enrichi plus tard avec des services de géolocalisation
    };

    const scanRef = await addDoc(collection(db, 'qrScans'), scanData);
    
    console.log(`✅ Scan QR enregistré avec ID: ${scanRef.id}`);
    console.log(`📊 Nouveau total de scans: ${(documentData.qrScanCount || 0) + 1}`);

    // Rediriger vers le document
    const documentUrl = `/api/document/${id}`;
    
    return NextResponse.redirect(new URL(documentUrl, request.url));

  } catch (error) {
    console.error('❌ Erreur lors du tracking du scan QR:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// Méthode GET pour permettre les scans QR depuis des applications mobiles
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
    
    console.log(`📱 Scan QR GET pour document: ${id}`);

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

    // Incrémenter le compteur de scans QR
    await updateDoc(doc(db, 'documents', id), {
      qrScanCount: increment(1)
    });

    // Enregistrer le scan dans la collection qrScans
    const scanData = {
      documentId: id,
      timestamp: serverTimestamp(),
      userAgent: userAgent,
      ip: ip,
      location: null
    };

    const scanRef = await addDoc(collection(db, 'qrScans'), scanData);
    
    console.log(`✅ Scan QR GET enregistré avec ID: ${scanRef.id}`);

    // Rediriger vers le document
    const documentUrl = `/api/document/${id}`;
    
    return NextResponse.redirect(new URL(documentUrl, request.url));

  } catch (error) {
    console.error('❌ Erreur lors du tracking du scan QR GET:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
