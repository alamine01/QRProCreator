const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Configuration Firebase (utilisez vos vraies clés)
const firebaseConfig = {
  apiKey: "AIzaSyB0KphmN9-QMDdn7lRjicz4QbJVrX99mnc",
  authDomain: "studio-6374747103-d0730.firebaseapp.com",
  projectId: "studio-6374747103-d0730",
  storageBucket: "studio-6374747103-d0730.firebasestorage.app",
  messagingSenderId: "541216504423",
  appId: "1:541216504423:web:dfc96bf03a35a0def972c2",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugDocumentTracking() {
  console.log('🔍 Diagnostic du système de tracking des documents...\n');

  try {
    // 1. Vérifier tous les documents
    console.log('📋 1. Documents existants:');
    const documentsSnapshot = await getDocs(collection(db, 'documents'));
    const documents = [];
    
    documentsSnapshot.forEach((doc) => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        name: data.name,
        classification: data.classification,
        statsTrackingEnabled: data.statsTrackingEnabled,
        downloadCount: data.downloadCount || 0,
        qrScanCount: data.qrScanCount || 0,
        ownerEmail: data.ownerEmail
      });
    });

    console.log(`   Total documents: ${documents.length}`);
    documents.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.name}`);
      console.log(`      - ID: ${doc.id}`);
      console.log(`      - Classification: ${doc.classification}`);
      console.log(`      - Tracking activé: ${doc.statsTrackingEnabled}`);
      console.log(`      - Téléchargements: ${doc.downloadCount}`);
      console.log(`      - Scans QR: ${doc.qrScanCount}`);
      console.log(`      - Email propriétaire: ${doc.ownerEmail}`);
      console.log('');
    });

    // 2. Vérifier les scans QR
    console.log('📱 2. Scans QR enregistrés:');
    try {
      const qrScansSnapshot = await getDocs(collection(db, 'qrScans'));
      const qrScans = [];
      
      qrScansSnapshot.forEach((doc) => {
        const data = doc.data();
        qrScans.push({
          id: doc.id,
          documentId: data.documentId,
          timestamp: data.timestamp,
          userAgent: data.userAgent,
          ip: data.ip
        });
      });

      console.log(`   Total scans QR: ${qrScans.length}`);
      qrScans.forEach((scan, index) => {
        console.log(`   ${index + 1}. Document: ${scan.documentId}`);
        console.log(`      - Timestamp: ${scan.timestamp?.toDate ? scan.timestamp.toDate() : scan.timestamp}`);
        console.log(`      - User Agent: ${scan.userAgent}`);
        console.log(`      - IP: ${scan.ip}`);
        console.log('');
      });
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération des scans QR:', error.message);
    }

    // 3. Vérifier les téléchargements
    console.log('💾 3. Téléchargements enregistrés:');
    try {
      const downloadsSnapshot = await getDocs(collection(db, 'documentDownloads'));
      const downloads = [];
      
      downloadsSnapshot.forEach((doc) => {
        const data = doc.data();
        downloads.push({
          id: doc.id,
          documentId: data.documentId,
          timestamp: data.timestamp,
          userAgent: data.userAgent,
          ip: data.ip
        });
      });

      console.log(`   Total téléchargements: ${downloads.length}`);
      downloads.forEach((download, index) => {
        console.log(`   ${index + 1}. Document: ${download.documentId}`);
        console.log(`      - Timestamp: ${download.timestamp?.toDate ? download.timestamp.toDate() : download.timestamp}`);
        console.log(`      - User Agent: ${download.userAgent}`);
        console.log(`      - IP: ${download.ip}`);
        console.log('');
      });
    } catch (error) {
      console.log('   ❌ Erreur lors de la récupération des téléchargements:', error.message);
    }

    // 4. Recommandations
    console.log('💡 4. Recommandations:');
    
    const publicDocs = documents.filter(doc => doc.classification === 'public');
    const trackingEnabledDocs = documents.filter(doc => doc.statsTrackingEnabled);
    
    console.log(`   - Documents publics: ${publicDocs.length}/${documents.length}`);
    console.log(`   - Documents avec tracking activé: ${trackingEnabledDocs.length}/${documents.length}`);
    
    if (publicDocs.length === 0) {
      console.log('   ⚠️  Aucun document public trouvé. Créez un document avec classification "public"');
    }
    
    if (trackingEnabledDocs.length === 0) {
      console.log('   ⚠️  Aucun document avec tracking activé. Vérifiez que statsTrackingEnabled = true');
    }
    
    const docsWithScans = documents.filter(doc => doc.qrScanCount > 0);
    if (docsWithScans.length === 0) {
      console.log('   ⚠️  Aucun scan QR enregistré. Testez le scan QR d\'un document');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
debugDocumentTracking().then(() => {
  console.log('\n✅ Diagnostic terminé');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
