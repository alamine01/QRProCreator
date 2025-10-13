/**
 * Script de test avec email valide
 * Usage: node test-with-email.js
 */

const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u";
const TEST_EMAIL = "daroul.itqaane.1@gmail.com"; // Email du propriétaire du document
const BASE_URL = "http://localhost:3000";

async function testWithValidEmail() {
  console.log('🔍 Test avec email valide...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}?email=${encodeURIComponent(TEST_EMAIL)}`);
    
    console.log(`📊 Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erreur: ${errorText}`);
    } else {
      const data = await response.json();
      console.log('✅ Statistiques récupérées');
      console.log(`📊 Document: ${data.name}`);
      console.log(`📊 Propriétaire: ${data.ownerEmail}`);
      console.log(`📊 Classification: ${data.classification}`);
      console.log(`📊 Tracking activé: ${data.statsTrackingEnabled}`);
      console.log(`📊 Téléchargements: ${data.downloadCount}`);
      console.log(`📊 Scans QR: ${data.qrScanCount}`);
      
      return data;
    }
    
    return null;
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return null;
  }
}

async function simulateScans(count = 5) {
  console.log(`\n🔲 Simulation de ${count} scans QR...`);
  
  let successCount = 0;
  
  for (let i = 0; i < count; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}/scan`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        console.log(`✅ Scan QR ${i + 1}/${count}`);
        successCount++;
      } else {
        console.log(`❌ Erreur scan ${i + 1}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erreur scan ${i + 1}: ${error.message}`);
    }
    
    // Pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Résultat: ${successCount}/${count} scans réussis`);
  return successCount;
}

async function simulateDownloads(count = 3) {
  console.log(`\n📥 Simulation de ${count} téléchargements...`);
  
  let successCount = 0;
  
  for (let i = 0; i < count; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/document/${TEST_DOCUMENT_ID}`);
      
      if (response.ok) {
        console.log(`✅ Téléchargement ${i + 1}/${count}`);
        successCount++;
      } else {
        console.log(`❌ Erreur téléchargement ${i + 1}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erreur téléchargement ${i + 1}: ${error.message}`);
    }
    
    // Pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Résultat: ${successCount}/${count} téléchargements réussis`);
  return successCount;
}

async function main() {
  console.log('🚀 Test complet avec email valide...\n');
  
  // 1. Vérifier les statistiques actuelles
  const stats = await testWithValidEmail();
  
  if (!stats) {
    console.log('\n❌ Impossible de récupérer les statistiques. Vérifiez:');
    console.log('- Que le document existe');
    console.log('- Que l\'email est correct');
    console.log('- Que le document est public et a le tracking activé');
    return;
  }
  
  // 2. Simuler des scans QR
  const scanSuccess = await simulateScans(5);
  
  // 3. Simuler des téléchargements
  const downloadSuccess = await simulateDownloads(3);
  
  // 4. Vérifier les nouvelles statistiques
  console.log('\n🔍 Vérification des nouvelles statistiques...');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre que Firebase se mette à jour
  
  const newStats = await testWithValidEmail();
  
  if (newStats) {
    console.log('\n📈 Comparaison:');
    console.log(`📊 Scans QR: ${stats.qrScanCount} → ${newStats.qrScanCount} (+${newStats.qrScanCount - stats.qrScanCount})`);
    console.log(`📊 Téléchargements: ${stats.downloadCount} → ${newStats.downloadCount} (+${newStats.downloadCount - stats.downloadCount})`);
  }
  
  console.log('\n🎉 Test terminé !');
  console.log(`🔗 Consultez les statistiques: ${BASE_URL}/document-stats/${TEST_DOCUMENT_ID}?email=${encodeURIComponent(TEST_EMAIL)}`);
}

main().catch(console.error);
