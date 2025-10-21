// Script pour simuler un téléchargement et tester le tracking

async function simulateDownload() {
  console.log('🧪 Simulation d\'un téléchargement...\n');

  try {
    // 1. Récupérer un document existant
    const response = await fetch('http://localhost:3000/api/admin/documents');
    if (!response.ok) {
      console.log('❌ Impossible de récupérer les documents. Assurez-vous que le serveur est démarré.');
      return;
    }

    const documents = await response.json();
    if (documents.length === 0) {
      console.log('❌ Aucun document trouvé. Créez d\'abord un document.');
      return;
    }

    const document = documents[0];
    console.log(`📄 Document sélectionné: ${document.name} (ID: ${document.id})`);

    // 2. Simuler un téléchargement via l'API
    console.log('\n💾 Simulation du téléchargement...');
    const downloadResponse = await fetch(`http://localhost:3000/api/document/${document.id}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script/1.0',
        'X-Forwarded-For': '127.0.0.1'
      }
    });

    if (downloadResponse.ok) {
      console.log('✅ Téléchargement simulé avec succès !');
      console.log(`   Status: ${downloadResponse.status}`);
      console.log(`   Headers: ${JSON.stringify(Object.fromEntries(downloadResponse.headers.entries()))}`);
    } else {
      console.log(`❌ Erreur lors du téléchargement: ${downloadResponse.status}`);
      const errorText = await downloadResponse.text();
      console.log(`   Erreur: ${errorText}`);
    }

    // 3. Attendre un peu puis vérifier les statistiques
    console.log('\n⏳ Attente de 2 secondes...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Vérifier les statistiques du document
    console.log('\n📊 Vérification des statistiques...');
    const statsResponse = await fetch(`http://localhost:3000/api/document-stats/${document.id}?email=${document.ownerEmail}&password=${document.ownerPassword || ''}`);
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log(`   Téléchargements trackés: ${stats.downloads?.length || 0}`);
      console.log(`   Scans trackés: ${stats.qrScans?.length || 0}`);
      console.log(`   Compteur téléchargements: ${stats.downloadCount || 0}`);
      console.log(`   Compteur scans: ${stats.qrScanCount || 0}`);
    } else {
      console.log('❌ Impossible de récupérer les statistiques');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error);
  }
}

// Exécuter si le script est appelé directement
if (typeof window === 'undefined') {
  simulateDownload();
}
