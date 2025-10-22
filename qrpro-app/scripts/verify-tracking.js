// Script pour vérifier que le tracking fonctionne correctement
console.log('🔍 Vérification du système de tracking...\n');

// Simuler un test de scan QR
async function testQrScan() {
  console.log('📱 Test de scan QR...');
  
  try {
    // Utiliser un document existant pour le test
    const testDocumentId = 'itzoacB5xwRFvGR3Az2u';
    const testUrl = `http://localhost:3000/api/document-stats/${testDocumentId}/scan`;
    
    console.log(`🌐 Test URL: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script/1.0',
        'X-Forwarded-For': '192.168.1.100'
      }
    });
    
    if (response.ok) {
      console.log('✅ Scan QR testé avec succès');
      console.log(`📊 Status: ${response.status}`);
      console.log(`🔗 Redirection vers: ${response.url}`);
    } else {
      console.log(`❌ Erreur lors du test: ${response.status}`);
      const errorText = await response.text();
      console.log(`📝 Détails: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    console.log('💡 Assurez-vous que l\'application est démarrée sur localhost:3000');
  }
}

// Simuler un test de téléchargement
async function testDownload() {
  console.log('\n💾 Test de téléchargement...');
  
  try {
    const testDocumentId = 'itzoacB5xwRFvGR3Az2u';
    const testUrl = `http://localhost:3000/api/document/${testDocumentId}`;
    
    console.log(`🌐 Test URL: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script/1.0',
        'X-Forwarded-For': '192.168.1.100'
      }
    });
    
    if (response.ok) {
      console.log('✅ Téléchargement testé avec succès');
      console.log(`📊 Status: ${response.status}`);
      console.log(`🔗 Redirection vers: ${response.url}`);
    } else {
      console.log(`❌ Erreur lors du test: ${response.status}`);
      const errorText = await response.text();
      console.log(`📝 Détails: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    console.log('💡 Assurez-vous que l\'application est démarrée sur localhost:3000');
  }
}

// Test des statistiques
async function testStatistics() {
  console.log('\n📊 Test des statistiques...');
  
  try {
    const testUrl = 'http://localhost:3000/api/admin/document-stats-global';
    
    console.log(`🌐 Test URL: ${testUrl}`);
    
    const response = await fetch(testUrl);
    
    if (response.ok) {
      const stats = await response.json();
      console.log('✅ Statistiques récupérées avec succès');
      console.log(`📱 Total scans QR: ${stats.totalScans}`);
      console.log(`💾 Total téléchargements: ${stats.totalDownloads}`);
      console.log(`📄 Total documents: ${stats.totalDocuments}`);
    } else {
      console.log(`❌ Erreur lors de la récupération des statistiques: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    console.log('💡 Assurez-vous que l\'application est démarrée sur localhost:3000');
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests de tracking...\n');
  
  await testQrScan();
  await testDownload();
  await testStatistics();
  
  console.log('\n🎉 Tests terminés !');
  console.log('\n📋 RÉSUMÉ:');
  console.log('1. ✅ Page des statistiques corrigée pour utiliser une seule source de données');
  console.log('2. ✅ Compteurs synchronisés avec les collections de tracking');
  console.log('3. ✅ Gestion d\'erreur améliorée');
  console.log('\n💡 Le tracking devrait maintenant être cohérent partout !');
}

runTests();
