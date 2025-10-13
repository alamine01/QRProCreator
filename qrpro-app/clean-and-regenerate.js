/**
 * Script pour nettoyer et regénérer des données avec de vrais timestamps Firebase
 * Usage: node clean-and-regenerate.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, updateDoc, getDocs, query, where, deleteDoc, Timestamp } = require('firebase/firestore');

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

// Données de test réalistes
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/120.0 Firefox/120.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
];

const IP_ADDRESSES = [
  "192.168.1.100", "192.168.1.101", "192.168.1.102", "192.168.1.103",
  "10.0.0.50", "10.0.0.51", "10.0.0.52", "10.0.0.53"
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Fonction pour générer une date aléatoire dans les 7 derniers jours
function getRandomRecentDate() {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 7);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes, 0, 0);
  
  return Timestamp.fromDate(date);
}

// Fonction pour nettoyer les données existantes
async function cleanExistingData() {
  console.log('🧹 Nettoyage des données existantes...');
  
  try {
    // Supprimer les scans QR existants
    const qrScansQuery = query(collection(db, 'qrScans'), where('documentId', '==', TEST_DOCUMENT_ID));
    const qrScansSnapshot = await getDocs(qrScansQuery);
    
    console.log(`🗑️  Suppression de ${qrScansSnapshot.size} scans QR existants...`);
    for (const docSnap of qrScansSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }
    
    // Supprimer les téléchargements existants
    const downloadsQuery = query(collection(db, 'downloads'), where('documentId', '==', TEST_DOCUMENT_ID));
    const downloadsSnapshot = await getDocs(downloadsQuery);
    
    console.log(`🗑️  Suppression de ${downloadsSnapshot.size} téléchargements existants...`);
    for (const docSnap of downloadsSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }
    
    // Réinitialiser les compteurs du document
    const docRef = doc(db, 'documents', TEST_DOCUMENT_ID);
    await updateDoc(docRef, {
      qrScanCount: 0,
      downloadCount: 0
    });
    
    console.log('✅ Nettoyage terminé');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Fonction pour générer de nouvelles données avec de vrais timestamps
async function generateNewData() {
  console.log('🔄 Génération de nouvelles données avec timestamps Firebase...');
  
  try {
    // Générer des scans QR
    console.log('🔲 Génération de 8 scans QR...');
    for (let i = 0; i < 8; i++) {
      const scanData = {
        documentId: TEST_DOCUMENT_ID,
        timestamp: getRandomRecentDate(),
        userAgent: getRandomElement(USER_AGENTS),
        ip: getRandomElement(IP_ADDRESSES),
        location: null
      };
      
      await addDoc(collection(db, 'qrScans'), scanData);
      console.log(`✅ Scan QR ${i + 1}/8 généré`);
      
      // Petite pause
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Générer des téléchargements
    console.log('📥 Génération de 5 téléchargements...');
    for (let i = 0; i < 5; i++) {
      const downloadData = {
        documentId: TEST_DOCUMENT_ID,
        timestamp: getRandomRecentDate(),
        userAgent: getRandomElement(USER_AGENTS),
        ip: getRandomElement(IP_ADDRESSES),
        location: null
      };
      
      await addDoc(collection(db, 'downloads'), downloadData);
      console.log(`✅ Téléchargement ${i + 1}/5 généré`);
      
      // Petite pause
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Mettre à jour les compteurs du document
    const docRef = doc(db, 'documents', TEST_DOCUMENT_ID);
    await updateDoc(docRef, {
      qrScanCount: 8,
      downloadCount: 5
    });
    
    console.log('✅ Nouvelles données générées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
  }
}

// Fonction pour vérifier les nouvelles données
async function verifyData() {
  console.log('🔍 Vérification des nouvelles données...');
  
  try {
    // Vérifier les scans QR
    const qrScansQuery = query(collection(db, 'qrScans'), where('documentId', '==', TEST_DOCUMENT_ID));
    const qrScansSnapshot = await getDocs(qrScansQuery);
    
    console.log(`📊 ${qrScansSnapshot.size} scans QR trouvés`);
    
    if (qrScansSnapshot.size > 0) {
      const firstScan = qrScansSnapshot.docs[0].data();
      console.log('🔲 Premier scan QR:');
      console.log(`   - Timestamp: ${firstScan.timestamp?.toDate ? firstScan.timestamp.toDate().toLocaleString('fr-FR') : 'Invalid'}`);
      console.log(`   - User Agent: ${firstScan.userAgent?.split(' ')[0] || 'Inconnu'}`);
      console.log(`   - IP: ${firstScan.ip || 'Inconnu'}`);
    }
    
    // Vérifier les téléchargements
    const downloadsQuery = query(collection(db, 'downloads'), where('documentId', '==', TEST_DOCUMENT_ID));
    const downloadsSnapshot = await getDocs(downloadsQuery);
    
    console.log(`📊 ${downloadsSnapshot.size} téléchargements trouvés`);
    
    if (downloadsSnapshot.size > 0) {
      const firstDownload = downloadsSnapshot.docs[0].data();
      console.log('📥 Premier téléchargement:');
      console.log(`   - Timestamp: ${firstDownload.timestamp?.toDate ? firstDownload.timestamp.toDate().toLocaleString('fr-FR') : 'Invalid'}`);
      console.log(`   - User Agent: ${firstDownload.userAgent?.split(' ')[0] || 'Inconnu'}`);
      console.log(`   - IP: ${firstDownload.ip || 'Inconnu'}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

async function main() {
  console.log('🚀 Script de nettoyage et régénération des données\n');
  
  await cleanExistingData();
  console.log('');
  await generateNewData();
  console.log('');
  await verifyData();
  
  console.log('\n🎉 Processus terminé !');
  console.log('📊 Les données ont été nettoyées et régénérées avec de vrais timestamps Firebase');
  console.log(`🔗 Consultez la page: http://localhost:3000/document-stats/${TEST_DOCUMENT_ID}?email=daroul.itqaane.1@gmail.com`);
}

main().catch(console.error);
