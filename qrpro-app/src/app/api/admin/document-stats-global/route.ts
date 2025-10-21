import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Récupération des statistiques globales de documents...');
    
    // Récupérer tous les scans QR
    let totalScans = 0;
    try {
      const qrScansQuery = query(
        collection(db, 'qrScans'),
        orderBy('timestamp', 'desc')
      );
      const qrScansSnapshot = await getDocs(qrScansQuery);
      totalScans = qrScansSnapshot.docs.length;
      console.log(`📱 Total scans QR: ${totalScans}`);
    } catch (error) {
      console.log('⚠️ Erreur lors de la récupération des scans QR:', error);
    }
    
    // Récupérer tous les téléchargements
    let totalDownloads = 0;
    try {
      const downloadsQuery = query(
        collection(db, 'documentDownloads'),
        orderBy('timestamp', 'desc')
      );
      const downloadsSnapshot = await getDocs(downloadsQuery);
      totalDownloads = downloadsSnapshot.docs.length;
      console.log(`💾 Total téléchargements: ${totalDownloads}`);
    } catch (error) {
      console.log('⚠️ Erreur lors de la récupération des téléchargements:', error);
    }
    
    // Récupérer les scans de cette semaine
    let weeklyScans = 0;
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const qrScansQuery = query(
        collection(db, 'qrScans'),
        orderBy('timestamp', 'desc')
      );
      const qrScansSnapshot = await getDocs(qrScansQuery);
      
      weeklyScans = qrScansSnapshot.docs.filter(doc => {
        const scanDate = doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp);
        return scanDate >= weekAgo;
      }).length;
      
      console.log(`📅 Scans cette semaine: ${weeklyScans}`);
    } catch (error) {
      console.log('⚠️ Erreur lors du calcul des scans hebdomadaires:', error);
    }
    
    // Récupérer le nombre total de documents
    let totalDocuments = 0;
    try {
      const documentsQuery = query(
        collection(db, 'documents'),
        orderBy('uploadedAt', 'desc')
      );
      const documentsSnapshot = await getDocs(documentsQuery);
      totalDocuments = documentsSnapshot.docs.length;
      console.log(`📄 Total documents: ${totalDocuments}`);
    } catch (error) {
      console.log('⚠️ Erreur lors de la récupération des documents:', error);
    }
    
    const globalStats = {
      totalScans,
      totalDownloads,
      weeklyScans,
      totalDocuments,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('📊 Statistiques globales calculées:', globalStats);
    
    return NextResponse.json(globalStats);
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques globales:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
