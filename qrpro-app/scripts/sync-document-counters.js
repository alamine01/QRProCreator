const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, where } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBw7uT3Qj4Qj4Qj4Qj4Qj4Qj4Qj4Qj4",
  authDomain: "qrpro-12345.firebaseapp.com",
  projectId: "qrpro-12345",
  storageBucket: "qrpro-12345.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncDocumentCounters() {
  try {
    console.log('🔄 Synchronisation des compteurs de documents...\n');

    // 1. Récupérer tous les documents
    console.log('📄 Récupération des documents...');
    const documentsSnapshot = await getDocs(collection(db, 'documents'));
    const documents = documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`✅ ${documents.length} documents trouvés\n`);

    // 2. Récupérer tous les scans QR
    console.log('📱 Récupération des scans QR...');
    const qrScansSnapshot = await getDocs(collection(db, 'qrScans'));
    const qrScans = qrScansSnapshot.docs.map(doc => ({
      id: doc.id,
      documentId: doc.data().documentId,
      ...doc.data()
    }));
    console.log(`✅ ${qrScans.length} scans QR trouvés\n`);

    // 3. Récupérer tous les téléchargements
    console.log('💾 Récupération des téléchargements...');
    const downloadsSnapshot = await getDocs(collection(db, 'documentDownloads'));
    const downloads = downloadsSnapshot.docs.map(doc => ({
      id: doc.id,
      documentId: doc.data().documentId,
      ...doc.data()
    }));
    console.log(`✅ ${downloads.length} téléchargements trouvés\n`);

    // 4. Calculer les vrais compteurs pour chaque document
    console.log('🧮 Calcul des vrais compteurs...');
    const documentCounters = {};
    
    // Compter les scans QR par document
    qrScans.forEach(scan => {
      if (!documentCounters[scan.documentId]) {
        documentCounters[scan.documentId] = { qrScans: 0, downloads: 0 };
      }
      documentCounters[scan.documentId].qrScans++;
    });

    // Compter les téléchargements par document
    downloads.forEach(download => {
      if (!documentCounters[download.documentId]) {
        documentCounters[download.documentId] = { qrScans: 0, downloads: 0 };
      }
      documentCounters[download.documentId].downloads++;
    });

    console.log('📊 Compteurs calculés:');
    Object.entries(documentCounters).forEach(([docId, counters]) => {
      console.log(`  Document ${docId}: ${counters.qrScans} scans, ${counters.downloads} téléchargements`);
    });
    console.log('');

    // 5. Mettre à jour les documents avec les vrais compteurs
    console.log('🔄 Mise à jour des documents...');
    let updatedCount = 0;
    
    for (const document of documents) {
      const realCounters = documentCounters[document.id] || { qrScans: 0, downloads: 0 };
      const currentQrScans = document.qrScanCount || 0;
      const currentDownloads = document.downloadCount || 0;
      
      // Vérifier si une mise à jour est nécessaire
      if (realCounters.qrScans !== currentQrScans || realCounters.downloads !== currentDownloads) {
        console.log(`📝 Mise à jour document ${document.id} (${document.name}):`);
        console.log(`  Scans QR: ${currentQrScans} → ${realCounters.qrScans}`);
        console.log(`  Téléchargements: ${currentDownloads} → ${realCounters.downloads}`);
        
        try {
          await updateDoc(doc(db, 'documents', document.id), {
            qrScanCount: realCounters.qrScans,
            downloadCount: realCounters.downloads
          });
          console.log(`  ✅ Document mis à jour\n`);
          updatedCount++;
        } catch (error) {
          console.log(`  ❌ Erreur lors de la mise à jour: ${error.message}\n`);
        }
      } else {
        console.log(`✅ Document ${document.id} déjà synchronisé\n`);
      }
    }

    // 6. Résumé final
    console.log('🎉 Synchronisation terminée !');
    console.log(`📊 Documents mis à jour: ${updatedCount}/${documents.length}`);
    
    // Calculer les totaux
    const totalQrScans = Object.values(documentCounters).reduce((sum, counters) => sum + counters.qrScans, 0);
    const totalDownloads = Object.values(documentCounters).reduce((sum, counters) => sum + counters.downloads, 0);
    
    console.log(`📱 Total scans QR: ${totalQrScans}`);
    console.log(`💾 Total téléchargements: ${totalDownloads}`);

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  }
}

// Exécuter la synchronisation
syncDocumentCounters();
