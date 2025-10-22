// Script simple pour tester le tracking sans Firebase
console.log('🧪 Test du système de tracking...\n');

// Simuler les données que nous avons vues dans le diagnostic
const mockData = {
  documents: [
    {
      id: 'itzoacB5xwRFvGR3Az2u',
      name: 'Shane_Black_Filmmaking_Presentation_Structured_QR_Code',
      qrScanCount: 7,  // Compteur dans le document
      downloadCount: 25, // Compteur dans le document
      ownerEmail: 'daroul.itqaane.1@gmail.com'
    },
    {
      id: 'GAMeb4N3KwCRRu5ioAv8', 
      name: '1760368323895_qdw8m3jrk7j',
      qrScanCount: 0,  // Compteur dans le document
      downloadCount: 0, // Compteur dans le document
      ownerEmail: 'oserever24@gmail.com'
    }
  ],
  qrScans: [
    { documentId: 'itzoacB5xwRFvGR3Az2u', timestamp: '2025-10-13T21:46:54Z' },
    { documentId: 'itzoacB5xwRFvGR3Az2u', timestamp: '2025-10-13T21:53:38Z' },
    { documentId: 'itzoacB5xwRFvGR3Az2u', timestamp: '2025-10-13T21:53:05Z' },
    { documentId: 'itzoacB5xwRFvGR3Az2u', timestamp: '2025-10-14T00:01:46Z' },
    { documentId: 'itzoacB5xwRFvGR3Az2u', timestamp: '2025-10-13T21:48:18Z' },
    { documentId: 'itzoacB5xwRFvGR3Az2u', timestamp: '2025-10-13T21:55:08Z' },
    { documentId: 'GAMeb4N3KwCRRu5ioAv8', timestamp: '2025-10-21T19:45:57Z' },
    { documentId: 'GAMeb4N3KwCRRu5ioAv8', timestamp: '2025-10-21T19:50:02Z' },
    { documentId: 'GAMeb4N3KwCRRu5ioAv8', timestamp: '2025-10-21T21:05:19Z' },
    { documentId: 'GAMeb4N3KwCRRu5ioAv8', timestamp: '2025-10-21T21:34:49Z' },
    { documentId: 'GAMeb4N3KwCRRu5ioAv8', timestamp: '2025-10-18T11:33:49Z' },
    { documentId: 'GAMeb4N3KwCRRu5ioAv8', timestamp: '2025-10-21T19:46:12Z' },
    { documentId: 'itzoacB5xwRFvGR3Az2u', timestamp: '2025-10-13T21:46:55Z' }
  ],
  downloads: [
    { documentId: 'GAMeb4N3KwCRRu5ioAv8', timestamp: '2025-10-21T21:34:52Z' }
  ]
};

console.log('📊 ANALYSE DES DONNÉES:\n');

// Calculer les vrais compteurs
const realCounters = {};

mockData.qrScans.forEach(scan => {
  if (!realCounters[scan.documentId]) {
    realCounters[scan.documentId] = { qrScans: 0, downloads: 0 };
  }
  realCounters[scan.documentId].qrScans++;
});

mockData.downloads.forEach(download => {
  if (!realCounters[download.documentId]) {
    realCounters[download.documentId] = { qrScans: 0, downloads: 0 };
  }
  realCounters[download.documentId].downloads++;
});

console.log('📱 SCANS QR RÉELS:');
Object.entries(realCounters).forEach(([docId, counters]) => {
  console.log(`  Document ${docId}: ${counters.qrScans} scans`);
});
console.log('');

console.log('💾 TÉLÉCHARGEMENTS RÉELS:');
Object.entries(realCounters).forEach(([docId, counters]) => {
  console.log(`  Document ${docId}: ${counters.downloads} téléchargements`);
});
console.log('');

// Comparer avec les compteurs dans les documents
console.log('🔍 COMPARAISON DES COMPTEURS:\n');

mockData.documents.forEach(doc => {
  const real = realCounters[doc.id] || { qrScans: 0, downloads: 0 };
  
  console.log(`📄 Document: ${doc.name} (${doc.id})`);
  console.log(`  Scans QR - Document: ${doc.qrScanCount}, Réel: ${real.qrScans} ${doc.qrScanCount === real.qrScans ? '✅' : '❌'}`);
  console.log(`  Téléchargements - Document: ${doc.downloadCount}, Réel: ${real.downloads} ${doc.downloadCount === real.downloads ? '✅' : '❌'}`);
  console.log('');
});

// Calculer les totaux
const totalQrScans = Object.values(realCounters).reduce((sum, counters) => sum + counters.qrScans, 0);
const totalDownloads = Object.values(realCounters).reduce((sum, counters) => sum + counters.downloads, 0);

console.log('📊 TOTAUX:');
console.log(`  Total scans QR: ${totalQrScans}`);
console.log(`  Total téléchargements: ${totalDownloads}`);

console.log('\n🎯 CONCLUSION:');
console.log('Le problème est que les compteurs dans les documents ne correspondent pas aux données réelles des collections de tracking.');
console.log('Il faut synchroniser les compteurs des documents avec les collections qrScans et documentDownloads.');
