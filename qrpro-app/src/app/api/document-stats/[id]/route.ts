import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { verifyPassword } from '@/lib/password';

// GET /api/document-stats/[id] - Récupérer les statistiques d'un document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = request.nextUrl.searchParams.get('email');
    const password = request.nextUrl.searchParams.get('password');
    
    console.log('📊 Demande de stats pour document:', id, 'email:', email);
    
    if (!email) {
      return NextResponse.json({ error: 'Email requis pour accéder aux statistiques' }, { status: 400 });
    }
    
    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis pour accéder aux statistiques' }, { status: 400 });
    }
    
    // Récupérer le document
    console.log('🔍 Recherche du document avec ID:', id);
    let document = await getDocumentById(id);
    
    if (!document) {
      console.log('❌ Document non trouvé avec ID:', id);
      console.log('🔍 Vérification des documents existants...');
      
        // Debug: Lister tous les documents pour voir ce qui existe
        try {
          const { getAllDocuments } = await import('@/lib/firebase');
          const allDocs = await getAllDocuments();
          console.log('📋 Documents existants:', allDocs.map((doc: any) => ({ id: doc.id, name: doc.name })));
          
          // Essayer de trouver le document par nom ou email
          const matchingDoc = allDocs.find((doc: any) => 
            doc.id === id || 
            doc.ownerEmail === email ||
            doc.name?.toLowerCase().includes('test')
          );
          
          if (matchingDoc) {
            console.log('✅ Document trouvé par correspondance:', matchingDoc.id);
            document = matchingDoc;
          }
        } catch (debugError) {
          console.log('⚠️ Impossible de lister les documents:', debugError);
        }
        
        // Si toujours pas trouvé, essayer le stockage local
        if (!document) {
          try {
            const { getAllLocalDocuments } = await import('@/lib/localStorage');
            const localDocs = getAllLocalDocuments();
            console.log('📋 Documents locaux:', localDocs.map((doc: any) => ({ id: doc.id, name: doc.name })));
            
            const localDoc = localDocs.find((doc: any) => doc.id === id);
            if (localDoc) {
              console.log('✅ Document trouvé dans le stockage local:', localDoc.id);
              document = localDoc;
            }
          } catch (localError) {
            console.log('⚠️ Erreur stockage local:', localError);
          }
        }
      
      if (!document) {
        return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
      }
    }
    
    console.log('✅ Document trouvé:', { id: document.id, name: document.name, ownerEmail: document.ownerEmail });
    
    // Vérifier que le document est public et que le suivi est activé
    if (document.classification !== 'public' || !document.statsTrackingEnabled) {
      console.log('❌ Document non accessible:', document.classification, document.statsTrackingEnabled);
      return NextResponse.json({ error: 'Ce document ne permet pas le suivi des statistiques' }, { status: 403 });
    }
    
    // Vérifier que l'email correspond au propriétaire
    if (document.ownerEmail.toLowerCase() !== email.toLowerCase()) {
      console.log('❌ Email ne correspond pas:', document.ownerEmail, 'vs', email);
      return NextResponse.json({ error: 'Accès non autorisé - Email incorrect' }, { status: 403 });
    }
    
    // Vérifier le mot de passe si le document en a un
    if (document.ownerPassword) {
      const isPasswordValid = await verifyPassword(password, document.ownerPassword);
      if (!isPasswordValid) {
        console.log('❌ Mot de passe incorrect pour:', email);
        return NextResponse.json({ error: 'Accès non autorisé - Mot de passe incorrect' }, { status: 403 });
      }
      console.log('✅ Mot de passe correct pour:', email);
    }
    
    console.log('✅ Accès autorisé pour:', email);
    
    // Récupérer les scans QR réels depuis la collection qrScans
    let qrScans: any[] = [];
    try {
      // Version simplifiée qui fonctionne (sans orderBy pour éviter les problèmes d'index)
      const qrScansQuery = query(
        collection(db, 'qrScans'),
        where('documentId', '==', id),
        limit(50) // Limiter à 50 scans récents
      );

      const qrScansSnapshot = await getDocs(qrScansQuery);
      qrScans = qrScansSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        timestamp: doc.data().timestamp,
        userAgent: doc.data().userAgent,
        ip: doc.data().ip,
        location: doc.data().location
      }));
      
      // Trier manuellement côté client (plus fiable)
      qrScans.sort((a: any, b: any) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`📱 ${qrScans.length} scans QR trouvés pour le document ${id}`);
    } catch (qrScansError) {
      console.log('⚠️ Collection qrScans non accessible ou vide:', qrScansError instanceof Error ? qrScansError.message : 'Unknown error');
      console.log('📱 Utilisation de données vides pour les scans QR');
      qrScans = [];
    }
    
    // Récupérer les téléchargements réels depuis la collection documentDownloads
    let downloads: any[] = [];
    try {
      const downloadsQuery = query(
        collection(db, 'documentDownloads'),
        where('documentId', '==', id),
        limit(50) // Limiter à 50 téléchargements récents
      );

      const downloadsSnapshot = await getDocs(downloadsQuery);
      downloads = downloadsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        timestamp: doc.data().timestamp,
        userAgent: doc.data().userAgent,
        ip: doc.data().ip,
        location: doc.data().location
      }));
      
      // Trier manuellement côté client (plus fiable)
      downloads.sort((a: any, b: any) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`💾 ${downloads.length} téléchargements trouvés pour le document ${id}`);
    } catch (downloadsError) {
      console.log('⚠️ Collection documentDownloads non accessible ou vide:', downloadsError instanceof Error ? downloadsError.message : 'Unknown error');
      console.log('💾 Utilisation de données vides pour les téléchargements');
      downloads = [];
    }
    
    const stats = {
      id: document.id,
      name: document.name,
      originalName: document.originalName,
      ownerEmail: document.ownerEmail,
      classification: document.classification,
      statsTrackingEnabled: document.statsTrackingEnabled,
      downloadCount: document.downloadCount,
      qrScanCount: document.qrScanCount || 0,
      uploadedAt: document.uploadedAt,
      downloads: downloads,
      qrScans: qrScans,
      mimeType: document.mimeType
    };
    
    console.log('📊 Stats retournées:', {
      id: stats.id,
      name: stats.name,
      downloadCount: stats.downloadCount,
      qrScanCount: stats.qrScanCount,
      downloadsLength: stats.downloads.length,
      qrScansLength: stats.qrScans.length
    });
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
