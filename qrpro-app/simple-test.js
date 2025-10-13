/**
 * Script de test ultra-simple pour générer des données de test
 * Usage: node simple-test.js
 */

// Configuration
const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u"; // Remplacez par un ID réel
const BASE_URL = "http://localhost:3000";

// Fonction pour simuler des requêtes
async function simulateRequests() {
  console.log('🚀 Génération de données de test...\n');
  
  const scanCount = 12;
  const downloadCount = 6;
  
  console.log(`🔲 Simulation de ${scanCount} scans QR...`);
  
  // Simuler des scans QR
  for (let i = 0; i < scanCount; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}/scan`);
      if (response.ok) {
        console.log(`✅ Scan QR ${i + 1}/${scanCount}`);
      } else {
        console.log(`❌ Erreur scan ${i + 1}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erreur scan ${i + 1}: ${error.message}`);
    }
    
    // Pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n📥 Simulation de ${downloadCount} téléchargements...`);
  
  // Simuler des téléchargements
  for (let i = 0; i < downloadCount; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/document/${TEST_DOCUMENT_ID}`);
      if (response.ok) {
        console.log(`✅ Téléchargement ${i + 1}/${downloadCount}`);
      } else {
        console.log(`❌ Erreur téléchargement ${i + 1}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erreur téléchargement ${i + 1}: ${error.message}`);
    }
    
    // Pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n🎉 Génération terminée !');
  console.log('📊 Consultez les statistiques dans votre navigateur');
  console.log(`🔗 URL: ${BASE_URL}/document-stats/${TEST_DOCUMENT_ID}?email=VOTRE_EMAIL`);
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      console.log('✅ Serveur accessible');
      return true;
    } else {
      console.log('❌ Serveur non accessible');
      return false;
    }
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🔧 Vérification du serveur...');
  
  const serverOk = await checkServer();
  if (!serverOk) {
    console.log('\n❌ Veuillez démarrer le serveur Next.js avec: npm run dev');
    return;
  }
  
  console.log(`\n📄 Document ID: ${TEST_DOCUMENT_ID}`);
  console.log('⚠️  Assurez-vous que ce document existe dans votre base de données\n');
  
  await simulateRequests();
}

// Lancer le script
main().catch(console.error);
