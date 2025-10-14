/**
 * Script pour vérifier et forcer l'application des règles Firebase
 * Usage: node check-firebase-rules.js
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

async function testFirebaseRulesDirectly() {
  console.log('🔍 Test direct des règles Firebase\n');
  
  try {
    // Test 1: Ajouter un scan QR directement
    console.log('1️⃣ Test d\'ajout direct de scan QR...');
    const scanData = {
      documentId: TEST_DOCUMENT_ID,
      timestamp: Timestamp.now(),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ip: '192.168.1.100',
      location: null
    };
    
    const scanRef = await addDoc(collection(db, 'qrScans'), scanData);
    console.log(`✅ Scan QR ajouté directement avec ID: ${scanRef.id}`);
    
    // Test 2: Ajouter un téléchargement directement
    console.log('\n2️⃣ Test d\'ajout direct de téléchargement...');
    const downloadData = {
      documentId: TEST_DOCUMENT_ID,
      timestamp: Timestamp.now(),
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      ip: '192.168.1.101',
      location: null
    };
    
    const downloadRef = await addDoc(collection(db, 'downloads'), downloadData);
    console.log(`✅ Téléchargement ajouté directement avec ID: ${downloadRef.id}`);
    
    // Test 3: Lire les données
    console.log('\n3️⃣ Test de lecture des données...');
    const qrScansQuery = query(collection(db, 'qrScans'), where('documentId', '==', TEST_DOCUMENT_ID));
    const qrScansSnapshot = await getDocs(qrScansQuery);
    console.log(`📊 ${qrScansSnapshot.size} scans QR trouvés`);
    
    const downloadsQuery = query(collection(db, 'downloads'), where('documentId', '==', TEST_DOCUMENT_ID));
    const downloadsSnapshot = await getDocs(downloadsQuery);
    console.log(`📊 ${downloadsSnapshot.size} téléchargements trouvés`);
    
    // Test 4: Afficher les dernières données
    if (qrScansSnapshot.size > 0) {
      console.log('\n🔲 Derniers scans QR:');
      qrScansSnapshot.docs.slice(-3).forEach((doc, index) => {
        const data = doc.data();
        const dateStr = data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString('fr-FR') : 'Invalid Date';
        console.log(`   ${index + 1}. ${dateStr} - ${data.userAgent?.split(' ')[0] || 'Inconnu'}`);
      });
    }
    
    if (downloadsSnapshot.size > 0) {
      console.log('\n📥 Derniers téléchargements:');
      downloadsSnapshot.docs.slice(-3).forEach((doc, index) => {
        const data = doc.data();
        const dateStr = data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString('fr-FR') : 'Invalid Date';
        console.log(`   ${index + 1}. ${dateStr} - ${data.userAgent?.split(' ')[0] || 'Inconnu'}`);
      });
    }
    
    console.log('\n✅ Test Firebase direct réussi !');
    console.log('🎯 Les règles Firebase fonctionnent correctement');
    console.log('🔧 Le problème vient probablement de l\'API Next.js');
    
  } catch (error) {
    console.error('❌ Erreur lors du test Firebase direct:', error);
    console.log('\n🔧 Solution:');
    console.log('1. Vérifiez que les règles Firebase incluent:');
    console.log('   match /qrScans/{scanId} { allow read, write: if true; }');
    console.log('   match /downloads/{downloadId} { allow read, write: if true; }');
    console.log('2. Assurez-vous que les règles ont été publiées');
    console.log('3. Attendez 2-3 minutes après la publication');
  }
}

async function testNextJSAPI() {
  console.log('\n🧪 Test de l\'API Next.js...\n');
  
  const BASE_URL = "http://localhost:3000";
  
  try {
    // Test de scan QR via API
    console.log('🔲 Test de scan QR via API...');
    const scanResponse = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}/scan`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Forwarded-For': '192.168.1.100'
      },
      redirect: 'manual'
    });
    
    console.log(`📊 Status API: ${scanResponse.status}`);
    
    if (scanResponse.status === 307) {
      console.log('✅ API fonctionne - Redirection détectée');
    } else if (scanResponse.status === 200) {
      console.log('✅ API fonctionne');
    } else {
      console.log('❌ Erreur API');
      const errorText = await scanResponse.text();
      console.log(`📄 Réponse: ${errorText}`);
    }
    
    // Attendre et vérifier les statistiques
    console.log('\n⏳ Attente de la mise à jour (3 secondes)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📊 Vérification des statistiques...');
    const statsResponse = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}?email=daroul.itqaane.1@gmail.com`);
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log(`📊 Téléchargements: ${stats.downloadCount}`);
      console.log(`📊 Scans QR: ${stats.qrScanCount}`);
      console.log(`📊 Nombre de scans dans l'historique: ${stats.qrScans?.length || 0}`);
      
      if (stats.qrScans && stats.qrScans.length > 0) {
        console.log('\n🔲 Derniers scans QR via API:');
        stats.qrScans.slice(0, 3).forEach((scan, index) => {
          let dateStr = 'Date inconnue';
          try {
            if (scan.timestamp?.toDate) {
              dateStr = scan.timestamp.toDate().toLocaleString('fr-FR');
            } else if (scan.timestamp?.seconds) {
              dateStr = new Date(scan.timestamp.seconds * 1000).toLocaleString('fr-FR');
            } else if (scan.timestamp) {
              dateStr = new Date(scan.timestamp).toLocaleString('fr-FR');
            }
          } catch (error) {
            console.log('Erreur formatage date:', error);
          }
          console.log(`   ${index + 1}. ${dateStr} - ${scan.userAgent?.split(' ')[0] || 'Inconnu'}`);
        });
      }
    } else {
      console.log('❌ Impossible de récupérer les statistiques');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error.message);
  }
}

async function main() {
  await testFirebaseRulesDirectly();
  await testNextJSAPI();
  
  console.log('\n🎯 DIAGNOSTIC COMPLET:');
  console.log('- Si le test Firebase direct réussit mais l\'API échoue, le problème vient de l\'API Next.js');
  console.log('- Si les deux échouent, le problème vient des règles Firebase');
  console.log('- Vérifiez les logs du serveur Next.js pour plus de détails');
}

main().catch(console.error);
