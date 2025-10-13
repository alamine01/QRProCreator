/**
 * Script de test avec diagnostic détaillé
 * Usage: node debug-test.js
 */

const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u";
const BASE_URL = "http://localhost:3000";

async function testScanAPI() {
  console.log('🔍 Test de l\'API de scan QR...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}/scan`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erreur: ${errorText}`);
    } else {
      console.log('✅ Scan QR réussi');
    }
    
    return response.ok;
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

async function testDocumentAPI() {
  console.log('\n🔍 Test de l\'API de document...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/document/${TEST_DOCUMENT_ID}`);
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erreur: ${errorText}`);
    } else {
      console.log('✅ Téléchargement réussi');
    }
    
    return response.ok;
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

async function testStatsAPI() {
  console.log('\n🔍 Test de l\'API de statistiques...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}?email=test@example.com`);
    
    console.log(`📊 Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erreur: ${errorText}`);
    } else {
      const data = await response.json();
      console.log('✅ Statistiques récupérées');
      console.log(`📊 Données:`, {
        id: data.id,
        name: data.name,
        downloadCount: data.downloadCount,
        qrScanCount: data.qrScanCount
      });
    }
    
    return response.ok;
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Diagnostic des APIs...\n');
  
  await testScanAPI();
  await testDocumentAPI();
  await testStatsAPI();
  
  console.log('\n📝 Résumé:');
  console.log('- Si les scans QR échouent, vérifiez les logs du serveur');
  console.log('- Si les téléchargements fonctionnent, l\'API de base est OK');
  console.log('- Si les statistiques fonctionnent, la page devrait s\'afficher');
}

main().catch(console.error);
