// Script de diagnostic complet pour Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp, getDocs } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');

const firebaseConfig = {
  apiKey: "AIzaSyB0KphmN9-QMDdn7lRjicz4QbJVrX99mnc",
  authDomain: "studio-6374747103-d0730.firebaseapp.com",
  projectId: "studio-6374747103-d0730",
  storageBucket: "studio-6374747103-d0730.firebasestorage.app",
  messagingSenderId: "541216504423",
  appId: "1:541216504423:web:dfc96bf03a35a0def972c2",
};

async function diagnosticComplet() {
  try {
    console.log('🔍 === DIAGNOSTIC FIREBASE COMPLET ===');
    
    // 1. Test d'initialisation
    console.log('\n1️⃣ Test d\'initialisation Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const storage = getStorage(app);
    console.log('✅ Firebase initialisé avec succès');
    
    // 2. Test de lecture Firestore
    console.log('\n2️⃣ Test de lecture Firestore...');
    try {
      const docsSnapshot = await getDocs(collection(db, 'documents'));
      console.log('✅ Lecture Firestore OK - Documents trouvés:', docsSnapshot.size);
    } catch (readError) {
      console.error('❌ Erreur lecture Firestore:', readError.message);
    }
    
    // 3. Test d'écriture Firestore
    console.log('\n3️⃣ Test d\'écriture Firestore...');
    try {
      const testData = {
        name: 'Test Diagnostic',
        uploadedAt: Timestamp.now(),
        isActive: true,
        test: true,
        timestamp: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'documents'), testData);
      console.log('✅ Écriture Firestore OK - ID:', docRef.id);
      
      // Nettoyer
      console.log('🧹 Document de test créé avec succès');
      
    } catch (writeError) {
      console.error('❌ Erreur écriture Firestore:', writeError.message);
      console.error('Code:', writeError.code);
    }
    
    // 4. Test Firebase Storage
    console.log('\n4️⃣ Test Firebase Storage...');
    try {
      // Créer un fichier de test
      const testContent = 'Test Firebase Storage';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      
      const storageRef = ref(storage, 'test/test-file.txt');
      const uploadResult = await uploadBytes(storageRef, testBlob);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      console.log('✅ Firebase Storage OK');
      console.log('📁 Fichier uploadé:', downloadURL);
      
    } catch (storageError) {
      console.error('❌ Erreur Firebase Storage:', storageError.message);
      console.error('Code:', storageError.code);
    }
    
    console.log('\n🎯 === DIAGNOSTIC TERMINÉ ===');
    
  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

diagnosticComplet();
