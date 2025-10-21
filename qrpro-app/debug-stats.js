// Script de debug pour vérifier les statistiques
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// Configuration Firebase (remplacez par vos vraies clés)
const firebaseConfig = {
  apiKey: "AIzaSyBvQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQ",
  authDomain: "qrpro-12345.firebaseapp.com",
  projectId: "qrpro-12345",
  storageBucket: "qrpro-12345.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugStats() {
  console.log('🔍 Debug des statistiques...\n');

  try {
    // 1. Vérifier les scans QR
    console.log('📱 Scans QR:');
    const qrScansSnapshot = await getDocs(collection(db, 'qrScans'));
    console.log(`  Total: ${qrScansSnapshot.docs.length}`);
    
    qrScansSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. Document: ${data.documentId} - ${data.timestamp?.toDate?.() || 'N/A'}`);
    });

    // 2. Vérifier les téléchargements
    console.log('\n💾 Téléchargements:');
    const downloadsSnapshot = await getDocs(collection(db, 'documentDownloads'));
    console.log(`  Total: ${downloadsSnapshot.docs.length}`);
    
    downloadsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. Document: ${data.documentId} - ${data.timestamp?.toDate?.() || 'N/A'}`);
    });

    // 3. Vérifier les documents
    console.log('\n📄 Documents:');
    const documentsSnapshot = await getDocs(collection(db, 'documents'));
    console.log(`  Total: ${documentsSnapshot.docs.length}`);
    
    documentsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ${data.name} - Scans: ${data.qrScanCount || 0} - Downloads: ${data.downloadCount || 0}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

debugStats();
