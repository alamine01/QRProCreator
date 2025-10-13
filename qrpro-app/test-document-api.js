// Script de test pour vérifier l'API des documents
async function testDocumentAPI() {
  try {
    console.log('🔍 Test de l\'API des documents...');
    
    // 1. Tester l'API admin pour récupérer les documents
    console.log('\n1️⃣ Test GET /api/admin/documents');
    const adminResponse = await fetch('http://localhost:3002/api/admin/documents');
    
    if (adminResponse.ok) {
      const documents = await adminResponse.json();
      console.log('✅ Documents récupérés:', documents.length);
      
      if (documents.length > 0) {
        const firstDoc = documents[0];
        console.log('📄 Premier document:', {
          id: firstDoc.id,
          name: firstDoc.name,
          publicUrl: firstDoc.publicUrl
        });
        
        // 2. Tester l'API publique avec le premier document
        console.log('\n2️⃣ Test GET /api/document/' + firstDoc.id);
        const publicResponse = await fetch(`http://localhost:3002/api/document/${firstDoc.id}`);
        
        if (publicResponse.ok) {
          const publicDoc = await publicResponse.json();
          console.log('✅ Document public récupéré:', publicDoc.name);
        } else {
          console.error('❌ Erreur API publique:', publicResponse.status, publicResponse.statusText);
          const errorText = await publicResponse.text();
          console.error('Détails:', errorText);
        }
      } else {
        console.log('⚠️ Aucun document trouvé pour tester');
      }
    } else {
      console.error('❌ Erreur API admin:', adminResponse.status, adminResponse.statusText);
    }
    
  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

testDocumentAPI();
