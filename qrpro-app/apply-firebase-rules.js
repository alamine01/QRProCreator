/**
 * Script pour appliquer les règles Firebase et tester les scans QR
 * Usage: node apply-firebase-rules.js
 */

const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u";
const BASE_URL = "http://localhost:3000";

console.log('🔧 Application des règles Firebase pour les scans QR\n');

console.log('📋 RÈGLES FIREBASE À APPLIQUER:');
console.log('=====================================');
console.log(`
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
`);
console.log('=====================================\n');

console.log('📝 INSTRUCTIONS DÉTAILLÉES:');
console.log('1. 🌐 Ouvrez https://console.firebase.google.com/');
console.log('2. 🎯 Sélectionnez le projet: studio-6374747103-d0730');
console.log('3. 📊 Allez dans "Firestore Database" > "Règles"');
console.log('4. 📝 Remplacez TOUTES les règles existantes par celles ci-dessus');
console.log('5. ✅ Cliquez sur "Publier"');
console.log('6. ⏳ Attendez 1-2 minutes que les règles se propagent\n');

async function testAfterRules() {
  console.log('🧪 Test après application des règles...\n');
  
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
    console.log('\n⏳ Attente de la mise à jour (5 secondes)...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📊 Vérification des statistiques...');
    const statsResponse = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}?email=daroul.itqaane.1@gmail.com`);
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log(`📊 Téléchargements: ${stats.downloadCount}`);
      console.log(`📊 Scans QR: ${stats.qrScanCount}`);
      console.log(`📊 Nombre de scans dans l'historique: ${stats.qrScans?.length || 0}`);
      
      if (stats.qrScans && stats.qrScans.length > 0) {
        console.log('\n🔲 Derniers scans QR:');
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
        console.log('\n🎉 SUCCÈS ! Les scans QR fonctionnent maintenant !');
      } else {
        console.log('\n⚠️  L\'historique des scans QR est encore vide');
        console.log('🔧 Vérifiez que les règles Firebase ont été appliquées correctement');
      }
    } else {
      console.log('❌ Impossible de récupérer les statistiques');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

async function main() {
  console.log('🎯 ÉTAPES IMPORTANTES:');
  console.log('1. Appliquez les règles Firebase ci-dessus');
  console.log('2. Attendez 1-2 minutes');
  console.log('3. Relancez ce script pour tester');
  console.log('4. Les scans QR devraient fonctionner et l\'historique se remplir\n');
  
  // Test immédiat pour voir l'état actuel
  await testAfterRules();
  
  console.log('\n📞 Si le problème persiste:');
  console.log('- Vérifiez que les règles Firebase sont exactement comme ci-dessus');
  console.log('- Assurez-vous que le projet Firebase est correct: studio-6374747103-d0730');
  console.log('- Vérifiez que les règles ont été publiées (bouton "Publier")');
}

main().catch(console.error);
