const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Configuration Firebase
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

async function testDocumentTracking() {
  console.log('🧪 Test du système de tracking des documents...\n');

  try {
    // 1. Récupérer un document public avec tracking activé
    const documentsSnapshot = await getDocs(collection(db, 'documents'));
    const publicDocs = [];
    
    documentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.classification === 'public' && data.statsTrackingEnabled) {
        publicDocs.push({
          id: doc.id,
          name: data.name,
          downloadCount: data.downloadCount || 0,
          qrScanCount: data.qrScanCount || 0
        });
      }
    });

    if (publicDocs.length === 0) {
      console.log('❌ Aucun document public avec tracking activé trouvé');
      return;
    }

    const testDoc = publicDocs[0];
    console.log(`📄 Document de test: ${testDoc.name} (ID: ${testDoc.id})`);
    console.log(`   - Téléchargements actuels: ${testDoc.downloadCount}`);
    console.log(`   - Scans QR actuels: ${testDoc.qrScanCount}\n`);

    // 2. Tester l'API de scan QR
    console.log('📱 Test de l\'API de scan QR...');
    try {
      const scanResponse = await fetch(`http://localhost:3000/api/document-stats/${testDoc.id}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Script/1.0'
        }
      });

      if (scanResponse.ok) {
        console.log('✅ Scan QR testé avec succès');
      } else {
        const errorData = await scanResponse.json();
        console.log('❌ Erreur scan QR:', errorData.error);
      }
    } catch (error) {
      console.log('❌ Erreur lors du test de scan QR:', error.message);
    }

    // 3. Tester l'API de téléchargement
    console.log('💾 Test de l\'API de téléchargement...');
    try {
      const downloadResponse = await fetch(`http://localhost:3000/api/document-stats/${testDoc.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Script/1.0'
        }
      });

      if (downloadResponse.ok) {
        const result = await downloadResponse.json();
        console.log('✅ Téléchargement testé avec succès');
        console.log(`   - Nouveau compteur: ${result.newCount}`);
      } else {
        const errorData = await downloadResponse.json();
        console.log('❌ Erreur téléchargement:', errorData.error);
      }
    } catch (error) {
      console.log('❌ Erreur lors du test de téléchargement:', error.message);
    }

    // 4. Vérifier les statistiques après les tests
    console.log('\n📊 Vérification des statistiques après les tests...');
    const updatedDoc = await getDoc(doc(db, 'documents', testDoc.id));
    if (updatedDoc.exists()) {
      const data = updatedDoc.data();
      console.log(`   - Téléchargements: ${data.downloadCount || 0} (était ${testDoc.downloadCount})`);
      console.log(`   - Scans QR: ${data.qrScanCount || 0} (était ${testDoc.qrScanCount})`);
    }

    // 5. Vérifier les collections de tracking
    console.log('\n🔍 Vérification des collections de tracking...');
    
    // Scans QR
    const qrScansSnapshot = await getDocs(collection(db, 'qrScans'));
    const qrScans = qrScansSnapshot.docs.filter(doc => doc.data().documentId === testDoc.id);
    console.log(`   - Scans QR pour ce document: ${qrScans.length}`);
    
    // Téléchargements
    const downloadsSnapshot = await getDocs(collection(db, 'documentDownloads'));
    const downloads = downloadsSnapshot.docs.filter(doc => doc.data().documentId === testDoc.id);
    console.log(`   - Téléchargements pour ce document: ${downloads.length}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testDocumentTracking().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
