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
    const document = await getDocumentById(id);
    
    if (!document) {
      console.log('❌ Document non trouvé:', id);
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }
    
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
      qrScans = qrScansSnapshot.docs.map(doc => ({
        id: doc.id,
        timestamp: doc.data().timestamp,
        userAgent: doc.data().userAgent,
        ip: doc.data().ip,
        location: doc.data().location
      }));
      
      // Trier manuellement côté client (plus fiable)
      qrScans.sort((a, b) => {
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
    
    // Simuler des données de téléchargement (dans un vrai système, vous auriez une collection séparée)
    const downloads = [
      {
        timestamp: document.uploadedAt,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip: '192.168.1.1'
      }
    ];
    
    // Ajouter quelques téléchargements simulés pour la démo
    for (let i = 0; i < Math.min(document.downloadCount, 10); i++) {
      const downloadDate = new Date(document.uploadedAt.toDate());
      downloadDate.setDate(downloadDate.getDate() + Math.floor(Math.random() * 30));
      
      downloads.push({
        timestamp: {
          toDate: () => downloadDate
        },
        userAgent: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)'].sort(() => 0.5 - Math.random())[0],
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`
      });
    }
    
    // Trier par date décroissante
    downloads.sort((a, b) => {
      const dateA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    
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
