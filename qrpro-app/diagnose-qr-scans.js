/**
 * Script de diagnostic pour les scans QR
 * Usage: node diagnose-qr-scans.js
 */

const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u";
const BASE_URL = "http://localhost:3000";

async function testQrScanAPI() {
  console.log('🔍 Diagnostic des scans QR\n');
  
  try {
    // Test 1: Vérifier que le serveur est accessible
    console.log('1️⃣ Test de connectivité serveur...');
    const serverTest = await fetch(`${BASE_URL}/`);
    if (serverTest.ok) {
      console.log('✅ Serveur accessible');
    } else {
      console.log('❌ Serveur non accessible');
      return;
    }
    
    // Test 2: Vérifier l'API de scan QR
    console.log('\n2️⃣ Test de l\'API de scan QR...');
    const qrScanResponse = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}/scan`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Forwarded-For': '192.168.1.100'
      },
      redirect: 'manual' // Ne pas suivre la redirection automatiquement
    });
    
    console.log(`📊 Status: ${qrScanResponse.status}`);
    console.log(`📊 Headers:`, Object.fromEntries(qrScanResponse.headers.entries()));
    
    if (qrScanResponse.status === 307) {
      console.log('✅ Redirection détectée (normal)');
      const location = qrScanResponse.headers.get('location');
      console.log(`🔗 Redirection vers: ${location}`);
    } else if (qrScanResponse.status === 200) {
      console.log('✅ Scan QR réussi');
    } else {
      console.log('❌ Erreur lors du scan QR');
      const errorText = await qrScanResponse.text();
      console.log(`📄 Réponse: ${errorText}`);
    }
    
    // Test 3: Vérifier les statistiques après le scan
    console.log('\n3️⃣ Vérification des statistiques...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
    
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
      }
    } else {
      console.log('❌ Impossible de récupérer les statistiques');
    }
    
    // Test 4: Test avec méthode POST
    console.log('\n4️⃣ Test avec méthode POST...');
    const postResponse = await fetch(`${BASE_URL}/api/document-stats/${TEST_DOCUMENT_ID}/scan`, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'X-Forwarded-For': '192.168.1.101',
        'Content-Type': 'application/json'
      },
      redirect: 'manual'
    });
    
    console.log(`📊 Status POST: ${postResponse.status}`);
    
    if (postResponse.status === 307) {
      console.log('✅ Redirection POST détectée');
    } else if (postResponse.status === 200) {
      console.log('✅ Scan QR POST réussi');
    } else {
      console.log('❌ Erreur lors du scan QR POST');
      const errorText = await postResponse.text();
      console.log(`📄 Réponse: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
  }
}

async function main() {
  await testQrScanAPI();
  
  console.log('\n🎯 Résumé du diagnostic:');
  console.log('- Si vous voyez des erreurs 500, le problème vient des règles Firebase');
  console.log('- Si vous voyez des redirections 307, l\'API fonctionne correctement');
  console.log('- Vérifiez les logs du serveur Next.js pour plus de détails');
}

main().catch(console.error);
