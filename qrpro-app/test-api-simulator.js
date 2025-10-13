/**
 * Script de test simple pour simuler des scans QR via l'API
 * Usage: node test-api-simulator.js
 */

const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u"; // Remplacez par un ID réel
const BASE_URL = "http://localhost:3000";

// Données de test
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  "Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/120.0 Firefox/120.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
];

// Fonction pour obtenir un élément aléatoire
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Fonction pour simuler un scan QR
async function simulateQrScan() {
  try {
    const response = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}/scan`, {
      method: 'GET',
      headers: {
        'User-Agent': getRandomElement(USER_AGENTS),
        'X-Forwarded-For': `192.168.1.${Math.floor(Math.random() * 255)}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Scan QR simulé avec succès');
      return true;
    } else {
      console.log(`❌ Erreur lors du scan QR: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

// Fonction pour simuler un téléchargement
async function simulateDownload() {
  try {
    const response = await fetch(`${BASE_URL}/api/document/${TEST_DOCUMENT_ID}`, {
      method: 'GET',
      headers: {
        'User-Agent': getRandomElement(USER_AGENTS),
        'X-Forwarded-For': `192.168.1.${Math.floor(Math.random() * 255)}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Téléchargement simulé avec succès');
      return true;
    } else {
      console.log(`❌ Erreur lors du téléchargement: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

// Fonction pour attendre
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du simulateur API...\n');
  console.log(`📄 Document ID: ${TEST_DOCUMENT_ID}`);
  console.log(`🌐 URL de base: ${BASE_URL}\n`);
  
  const scanCount = 10;
  const downloadCount = 5;
  
  console.log(`🔲 Simulation de ${scanCount} scans QR...`);
  for (let i = 0; i < scanCount; i++) {
    await simulateQrScan();
    await sleep(500); // Pause de 500ms entre chaque scan
  }
  
  console.log(`\n📥 Simulation de ${downloadCount} téléchargements...`);
  for (let i = 0; i < downloadCount; i++) {
    await simulateDownload();
    await sleep(500); // Pause de 500ms entre chaque téléchargement
  }
  
  console.log('\n🎉 Simulation terminée !');
  console.log('📊 Consultez maintenant les statistiques dans votre navigateur');
  console.log(`🔗 URL: ${BASE_URL}/document-stats/${TEST_DOCUMENT_ID}?email=VOTRE_EMAIL`);
}

// Lancer le script
main().catch(console.error);
