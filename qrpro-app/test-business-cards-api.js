// Test simple pour vérifier l'API des cartes de visite
const testBusinessCardsAPI = async () => {
  try {
    console.log('Test de l\'API des cartes de visite...');
    
    // Test GET
    const response = await fetch('/api/admin/business-cards');
    console.log('Status GET:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Données reçues:', data);
    } else {
      const error = await response.text();
      console.error('Erreur GET:', error);
    }
    
    // Test POST avec des données de test
    const testData = {
      name: 'Test User',
      title: 'Test Title',
      email: 'test@example.com',
      phonePrimary: '+221 77 123 45 67',
      location: 'Dakar, Sénégal',
      isActive: true
    };
    
    const postResponse = await fetch('/api/admin/business-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Status POST:', postResponse.status);
    
    if (postResponse.ok) {
      const newCard = await postResponse.json();
      console.log('Carte créée:', newCard);
    } else {
      const error = await postResponse.text();
      console.error('Erreur POST:', error);
    }
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
};

// Exécuter le test
testBusinessCardsAPI();
