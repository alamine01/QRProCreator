/**
 * Script pour corriger les règles Firebase et tester les scans QR
 * Usage: node fix-firebase-rules.js
 */

const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u";
const BASE_URL = "http://localhost:3000";

// Règles Firebase corrigées pour les collections qrScans et downloads
const FIREBASE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les documents
    match /documents/{documentId} {
      allow read, write: if true;
    }
    
    // Règles pour les scans QR
    match /qrScans/{scanId} {
      allow read, write: if true;
    }
    
    // Règles pour les téléchargements
    match /downloads/{downloadId} {
      allow read, write: if true;
    }
    
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // Règles pour les commandes
    match /orders/{orderId} {
      allow read, write: if true;
    }
    
    // Règles pour les cartes de visite
    match /businessCards/{cardId} {
      allow read, write: if true;
    }
  }
}
`;

console.log('🔧 Correction des règles Firebase pour les scans QR\n');

console.log('📋 Règles Firebase recommandées:');
console.log('=====================================');
console.log(FIREBASE_RULES);
console.log('=====================================\n');

console.log('📝 Instructions pour appliquer les règles:');
console.log('1. Allez sur https://console.firebase.google.com/');
console.log('2. Sélectionnez votre projet: studio-6374747103-d0730');
console.log('3. Allez dans "Firestore Database" > "Règles"');
console.log('4. Remplacez les règles existantes par celles ci-dessus');
console.log('5. Cliquez sur "Publier"\n');

async function testAfterRulesFix() {
  console.log('🧪 Test après correction des règles...\n');
  
  try {
    // Test de scan QR
    console.log('🔲 Test de scan QR...');
    const scanResponse = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}/scan`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Forwarded-For': '192.168.1.100'
      },
      redirect: 'manual'
    });
    
    console.log(`📊 Status: ${scanResponse.status}`);
    
    if (scanResponse.status === 307) {
      console.log('✅ Scan QR réussi - Redirection détectée');
      const location = scanResponse.headers.get('location');
      console.log(`🔗 Redirection vers: ${location}`);
    } else if (scanResponse.status === 200) {
      console.log('✅ Scan QR réussi');
    } else {
      console.log('❌ Erreur lors du scan QR');
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
        const lastScan = stats.qrScans[0];
        console.log(`🔲 Dernier scan: ${lastScan.timestamp?.toDate ? lastScan.timestamp.toDate().toLocaleString('fr-FR') : 'Invalid Date'}`);
        console.log(`🌐 User Agent: ${lastScan.userAgent?.split(' ')[0] || 'Inconnu'}`);
        console.log(`📍 IP: ${lastScan.ip || 'Inconnu'}`);
      }
    } else {
      console.log('❌ Impossible de récupérer les statistiques');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

async function main() {
  console.log('🎯 Prochaines étapes:');
  console.log('1. Appliquez les règles Firebase ci-dessus');
  console.log('2. Relancez ce script pour tester');
  console.log('3. Les scans QR devraient fonctionner correctement\n');
  
  // Test immédiat pour voir l'état actuel
  await testAfterRulesFix();
}

main().catch(console.error);
