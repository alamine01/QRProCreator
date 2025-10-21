const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

// Configuration Firebase (utilisez vos vraies clés)
const firebaseConfig = {
  apiKey: "AIzaSyBvQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQ",
  authDomain: "qrpro-12345.firebaseapp.com",
  projectId: "qrpro-12345",
  storageBucket: "qrpro-12345.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDownloadTracking() {
  console.log('🔍 Test du tracking des téléchargements...\n');

  try {
    // 1. Vérifier les documents existants
    console.log('📄 Documents existants:');
    const documentsSnapshot = await getDocs(collection(db, 'documents'));
    const documents = documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      downloadCount: doc.data().downloadCount || 0,
      qrScanCount: doc.data().qrScanCount || 0
    }));
    
    documents.forEach(doc => {
      console.log(`  - ${doc.name} (ID: ${doc.id})`);
      console.log(`    Téléchargements: ${doc.downloadCount}`);
      console.log(`    Scans QR: ${doc.qrScanCount}`);
    });

    // 2. Vérifier la collection documentDownloads
    console.log('\n💾 Téléchargements enregistrés:');
    const downloadsSnapshot = await getDocs(collection(db, 'documentDownloads'));
    const downloads = downloadsSnapshot.docs.map(doc => ({
      id: doc.id,
      documentId: doc.data().documentId,
      timestamp: doc.data().timestamp,
      userAgent: doc.data().userAgent
    }));
    
    console.log(`  Total téléchargements trackés: ${downloads.length}`);
    downloads.forEach((download, index) => {
      console.log(`  ${index + 1}. Document ${download.documentId} - ${download.timestamp?.toDate?.() || 'N/A'}`);
    });

    // 3. Vérifier la collection qrScans
    console.log('\n📱 Scans QR enregistrés:');
    const scansSnapshot = await getDocs(collection(db, 'qrScans'));
    const scans = scansSnapshot.docs.map(doc => ({
      id: doc.id,
      documentId: doc.data().documentId,
      timestamp: doc.data().timestamp,
      userAgent: doc.data().userAgent
    }));
    
    console.log(`  Total scans trackés: ${scans.length}`);
    scans.forEach((scan, index) => {
      console.log(`  ${index + 1}. Document ${scan.documentId} - ${scan.timestamp?.toDate?.() || 'N/A'}`);
    });

    // 4. Analyser les différences
    console.log('\n📊 Analyse:');
    const totalDocumentDownloads = documents.reduce((sum, doc) => sum + doc.downloadCount, 0);
    const totalTrackedDownloads = downloads.length;
    const totalDocumentScans = documents.reduce((sum, doc) => sum + doc.qrScanCount, 0);
    const totalTrackedScans = scans.length;

    console.log(`  Téléchargements dans documents: ${totalDocumentDownloads}`);
    console.log(`  Téléchargements trackés: ${totalTrackedDownloads}`);
    console.log(`  Scans dans documents: ${totalDocumentScans}`);
    console.log(`  Scans trackés: ${totalTrackedScans}`);

    if (totalTrackedDownloads === 0) {
      console.log('\n❌ PROBLÈME: Aucun téléchargement tracké trouvé !');
      console.log('   Les téléchargements ne passent peut-être pas par l\'API /api/document/[id]');
    } else {
      console.log('\n✅ Le tracking des téléchargements fonctionne !');
    }

    if (totalTrackedScans === 0) {
      console.log('\n❌ PROBLÈME: Aucun scan tracké trouvé !');
    } else {
      console.log('\n✅ Le tracking des scans fonctionne !');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testDownloadTracking();
