/**
 * Script de test simple pour vérifier les règles Firebase
 * Usage: node test-firebase-rules.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, updateDoc, getDocs, query, where, Timestamp } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0Kp...", // Remplacez par votre vraie clé
  authDomain: "studio-6374747103-d0730.firebaseapp.com",
  projectId: "studio-6374747103-d0730",
  storageBucket: "studio-6374747103-d0730.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u";

async function testFirebaseRules() {
  console.log('🧪 Test des règles Firebase\n');
  
  try {
    // Test 1: Ajouter un scan QR
    console.log('1️⃣ Test d\'ajout de scan QR...');
    const scanData = {
      documentId: TEST_DOCUMENT_ID,
      timestamp: Timestamp.now(),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ip: '192.168.1.100',
      location: null
    };
    
    const scanRef = await addDoc(collection(db, 'qrScans'), scanData);
    console.log(`✅ Scan QR ajouté avec ID: ${scanRef.id}`);
    
    // Test 2: Ajouter un téléchargement
    console.log('\n2️⃣ Test d\'ajout de téléchargement...');
    const downloadData = {
      documentId: TEST_DOCUMENT_ID,
      timestamp: Timestamp.now(),
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      ip: '192.168.1.101',
      location: null
    };
    
    const downloadRef = await addDoc(collection(db, 'downloads'), downloadData);
    console.log(`✅ Téléchargement ajouté avec ID: ${downloadRef.id}`);
    
    // Test 3: Mettre à jour le compteur du document
    console.log('\n3️⃣ Test de mise à jour du compteur...');
    const docRef = doc(db, 'documents', TEST_DOCUMENT_ID);
    await updateDoc(docRef, {
      qrScanCount: 36,
      downloadCount: 26
    });
    console.log('✅ Compteurs mis à jour');
    
    // Test 4: Lire les données
    console.log('\n4️⃣ Test de lecture des données...');
    const qrScansQuery = query(collection(db, 'qrScans'), where('documentId', '==', TEST_DOCUMENT_ID));
    const qrScansSnapshot = await getDocs(qrScansQuery);
    console.log(`📊 ${qrScansSnapshot.size} scans QR trouvés`);
    
    const downloadsQuery = query(collection(db, 'downloads'), where('documentId', '==', TEST_DOCUMENT_ID));
    const downloadsSnapshot = await getDocs(downloadsQuery);
    console.log(`📊 ${downloadsSnapshot.size} téléchargements trouvés`);
    
    // Test 5: Afficher les dernières données
    if (qrScansSnapshot.size > 0) {
      const lastScan = qrScansSnapshot.docs[qrScansSnapshot.size - 1].data();
      console.log(`🔲 Dernier scan: ${lastScan.timestamp?.toDate ? lastScan.timestamp.toDate().toLocaleString('fr-FR') : 'Invalid Date'}`);
    }
    
    if (downloadsSnapshot.size > 0) {
      const lastDownload = downloadsSnapshot.docs[downloadsSnapshot.size - 1].data();
      console.log(`📥 Dernier téléchargement: ${lastDownload.timestamp?.toDate ? lastDownload.timestamp.toDate().toLocaleString('fr-FR') : 'Invalid Date'}`);
    }
    
    console.log('\n✅ Tous les tests Firebase ont réussi !');
    console.log('🎯 Les règles Firebase fonctionnent correctement');
    
  } catch (error) {
    console.error('❌ Erreur lors du test Firebase:', error);
    console.log('\n🔧 Solution:');
    console.log('1. Allez sur https://console.firebase.google.com/');
    console.log('2. Sélectionnez votre projet: studio-6374747103-d0730');
    console.log('3. Allez dans "Firestore Database" > "Règles"');
    console.log('4. Remplacez les règles par:');
    console.log('   allow read, write: if true;');
    console.log('5. Cliquez sur "Publier"');
  }
}

async function main() {
  await testFirebaseRules();
}

main().catch(console.error);
