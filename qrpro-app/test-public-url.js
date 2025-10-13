// Test simple de l'URL publique
async function testPublicURL() {
  try {
    console.log('🔍 Test de l\'URL publique...');
    
    // Tester avec l'ID Firebase existant
    const testId = 'OU8izSLyseAZFMFaTEQs';
    const publicUrl = `http://localhost:3002/api/document/${testId}`;
    
    console.log('📄 Test URL:', publicUrl);
    
    const response = await fetch(publicUrl);
    
    if (response.ok) {
      const doc = await response.json();
      console.log('✅ Document trouvé:', doc.name);
      console.log('🌐 URL publique du document:', doc.publicUrl);
    } else {
      console.error('❌ Erreur:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

testPublicURL();
