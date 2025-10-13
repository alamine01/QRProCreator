/**
 * Script de test pour simuler des scans QR et téléchargements
 * Usage: node test-stats-simulator.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, updateDoc, getDoc, Timestamp } = require('firebase/firestore');

// Configuration Firebase (utilisez vos vraies valeurs)
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

// ID du document à tester (remplacez par un vrai ID de votre base)
const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u"; // Remplacez par un ID réel

// Données de test réalistes
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/120.0 Firefox/120.0",
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
];

const IP_ADDRESSES = [
  "192.168.1.100", "192.168.1.101", "192.168.1.102", "192.168.1.103",
  "10.0.0.50", "10.0.0.51", "10.0.0.52", "10.0.0.53",
  "172.16.0.10", "172.16.0.11", "172.16.0.12", "172.16.0.13"
];

const LOCATIONS = [
  "Paris, France", "Lyon, France", "Marseille, France", "Toulouse, France",
  "Nice, France", "Nantes, France", "Strasbourg, France", "Montpellier, France",
  "Bordeaux, France", "Lille, France", "Rennes, France", "Reims, France"
];

// Fonction pour générer une date aléatoire dans les 30 derniers jours
function getRandomDate(daysAgo = 30) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes, 0, 0);
  
  return Timestamp.fromDate(date);
}

// Fonction pour obtenir un élément aléatoire d'un tableau
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Fonction pour simuler des scans QR
async function simulateQrScans(count = 15) {
  console.log(`🔲 Simulation de ${count} scans QR...`);
  
  for (let i = 0; i < count; i++) {
    try {
      const scanData = {
        documentId: TEST_DOCUMENT_ID,
        timestamp: getRandomDate(30),
        userAgent: getRandomElement(USER_AGENTS),
        ip: getRandomElement(IP_ADDRESSES),
        location: getRandomElement(LOCATIONS)
      };

      await addDoc(collection(db, 'qrScans'), scanData);
      console.log(`✅ Scan QR ${i + 1}/${count} ajouté`);
      
      // Petite pause pour éviter les erreurs de rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout du scan QR ${i + 1}:`, error.message);
    }
  }
}

// Fonction pour simuler des téléchargements
async function simulateDownloads(count = 8) {
  console.log(`📥 Simulation de ${count} téléchargements...`);
  
  for (let i = 0; i < count; i++) {
    try {
      const downloadData = {
        documentId: TEST_DOCUMENT_ID,
        timestamp: getRandomDate(30),
        userAgent: getRandomElement(USER_AGENTS),
        ip: getRandomElement(IP_ADDRESSES),
        location: getRandomElement(LOCATIONS)
      };

      await addDoc(collection(db, 'downloads'), downloadData);
      console.log(`✅ Téléchargement ${i + 1}/${count} ajouté`);
      
      // Petite pause pour éviter les erreurs de rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout du téléchargement ${i + 1}:`, error.message);
    }
  }
}

// Fonction pour mettre à jour les compteurs du document
async function updateDocumentCounters() {
  console.log('📊 Mise à jour des compteurs du document...');
  
  try {
    // Compter les scans QR
    const qrScansSnapshot = await getDocs(query(collection(db, 'qrScans'), where('documentId', '==', TEST_DOCUMENT_ID)));
    const qrScanCount = qrScansSnapshot.size;
    
    // Compter les téléchargements
    const downloadsSnapshot = await getDocs(query(collection(db, 'downloads'), where('documentId', '==', TEST_DOCUMENT_ID)));
    const downloadCount = downloadsSnapshot.size;
    
    // Mettre à jour le document
    const docRef = doc(db, 'documents', TEST_DOCUMENT_ID);
    await updateDoc(docRef, {
      qrScanCount: qrScanCount,
      downloadCount: downloadCount
    });
    
    console.log(`✅ Compteurs mis à jour: ${qrScanCount} scans QR, ${downloadCount} téléchargements`);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des compteurs:', error.message);
  }
}

// Fonction pour vérifier que le document existe
async function checkDocumentExists() {
  console.log('🔍 Vérification de l\'existence du document...');
  
  try {
    const docRef = doc(db, 'documents', TEST_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`✅ Document trouvé: "${data.name}"`);
      console.log(`   - Propriétaire: ${data.ownerEmail}`);
      console.log(`   - Classification: ${data.classification}`);
      return true;
    } else {
      console.log(`❌ Document avec l'ID "${TEST_DOCUMENT_ID}" non trouvé`);
      console.log('   Veuillez vérifier l\'ID du document dans le script');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du document:', error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du simulateur de statistiques...\n');
  
  // Vérifier que le document existe
  const documentExists = await checkDocumentExists();
  if (!documentExists) {
    console.log('\n❌ Arrêt du script - Document non trouvé');
    return;
  }
  
  console.log('\n📝 Instructions:');
  console.log('1. Assurez-vous que le serveur Next.js est démarré');
  console.log('2. Ouvrez la page de statistiques dans votre navigateur');
  console.log('3. Les données de test seront ajoutées à votre base Firebase\n');
  
  // Simuler les données
  await simulateQrScans(15);
  console.log('');
  await simulateDownloads(8);
  console.log('');
  await updateDocumentCounters();
  
  console.log('\n🎉 Simulation terminée !');
  console.log('📊 Vous pouvez maintenant consulter les statistiques dans votre navigateur');
  console.log(`🔗 URL: http://localhost:3000/document-stats/${TEST_DOCUMENT_ID}?email=VOTRE_EMAIL`);
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Lancer le script
main().catch(console.error);
