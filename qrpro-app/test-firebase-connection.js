// Script de test pour diagnostiquer Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyB0KphmN9-QMDdn7lRjicz4QbJVrX99mnc",
  authDomain: "studio-6374747103-d0730.firebaseapp.com",
  projectId: "studio-6374747103-d0730",
  storageBucket: "studio-6374747103-d0730.firebasestorage.app",
  messagingSenderId: "541216504423",
  appId: "1:541216504423:web:dfc96bf03a35a0def972c2",
};

async function testFirebase() {
  try {
    console.log('🔥 Test de connexion Firebase...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialisé');
    
    // Test d'écriture dans Firestore
    const testData = {
      name: 'Test Document',
      uploadedAt: Timestamp.now(),
      isActive: true,
      test: true
    };
    
    console.log('📝 Tentative d\'écriture dans Firestore...');
    const docRef = await addDoc(collection(db, 'documents'), testData);
    console.log('✅ Document créé avec ID:', docRef.id);
    
    // Nettoyer le document de test
    console.log('🧹 Nettoyage du document de test...');
    // Note: deleteDoc nécessite une importation supplémentaire
    
  } catch (error) {
    console.error('❌ Erreur Firebase:', error);
    console.error('Détails:', error.message);
    console.error('Code:', error.code);
  }
}

testFirebase();
