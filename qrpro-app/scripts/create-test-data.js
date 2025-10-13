// Script pour créer des données de test dans Firebase
// À exécuter dans la console du navigateur (F12)

async function createTestData() {
  try {
    console.log('🚀 Création des données de test...');
    
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore();
    
    // Créer quelques utilisateurs de test
    const testUsers = [
      {
        googleId: 'test_user_1',
        email: 'user1@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        profession: 'Développeur',
        phone: '771234567',
        location: 'Dakar',
        profileSlug: 'jean-dupont',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        googleId: 'test_user_2',
        email: 'user2@example.com',
        firstName: 'Marie',
        lastName: 'Diop',
        profession: 'Designer',
        phone: '771234568',
        location: 'Thiès',
        profileSlug: 'marie-diop',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Créer quelques commandes de test
    const testOrders = [
      {
        userId: 'test_user_1',
        orderNumber: 'QR2501001',
        items: [
          {
            productId: 'nfc-card',
            productName: 'Carte NFC',
            quantity: 1,
            unitPrice: 20000,
            totalPrice: 20000
          }
        ],
        customerInfo: {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'user1@example.com',
          phone: '771234567',
          address: 'Dakar, Sénégal',
          city: 'Dakar',
          notes: 'Livraison rapide souhaitée'
        },
        paymentInfo: {
          method: 'orange_money',
          provider: 'orange_money',
          phoneNumber: '771234567',
          status: 'completed'
        },
        totalAmount: 20000,
        currency: 'FCFA',
        status: 'delivered',
        createdAt: new Date(),
        updatedAt: new Date(),
        deliveredAt: new Date()
      },
      {
        userId: 'test_user_2',
        orderNumber: 'QR2501002',
        items: [
          {
            productId: 'complete-pack',
            productName: 'Pack Complet',
            quantity: 1,
            unitPrice: 21500,
            totalPrice: 21500
          }
        ],
        customerInfo: {
          firstName: 'Marie',
          lastName: 'Diop',
          email: 'user2@example.com',
          phone: '771234568',
          address: 'Thiès, Sénégal',
          city: 'Thiès'
        },
        paymentInfo: {
          method: 'wave_direct',
          provider: 'wave',
          status: 'completed'
        },
        totalAmount: 21500,
        currency: 'FCFA',
        status: 'processing',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Créer quelques cartes de visite de test
    const testBusinessCards = [
      {
        name: 'QR Pro Creator',
        title: 'Service de QR Code',
        phonePrimary: '771234569',
        email: 'contact@qrprocreator.com',
        location: 'Dakar, Sénégal',
        address: 'Plateau, Dakar',
        instagram: 'https://instagram.com/qrprocreator',
        whatsapp: 'https://wa.me/221771234569',
        linkedin: 'https://linkedin.com/company/qrprocreator',
        uniqueId: 'card_qrpro_001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tech Solutions',
        title: 'Solutions Technologiques',
        phonePrimary: '771234570',
        email: 'info@techsolutions.sn',
        location: 'Dakar, Sénégal',
        address: 'Almadies, Dakar',
        facebook: 'https://facebook.com/techsolutions',
        twitter: 'https://twitter.com/techsolutions',
        uniqueId: 'card_tech_001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Ajouter les utilisateurs
    console.log('👥 Création des utilisateurs...');
    for (const user of testUsers) {
      await addDoc(collection(db, 'users'), user);
      console.log(`✅ Utilisateur créé: ${user.firstName} ${user.lastName}`);
    }
    
    // Ajouter les commandes
    console.log('🛒 Création des commandes...');
    for (const order of testOrders) {
      await addDoc(collection(db, 'orders'), order);
      console.log(`✅ Commande créée: ${order.orderNumber}`);
    }
    
    // Ajouter les cartes de visite
    console.log('💳 Création des cartes de visite...');
    for (const card of testBusinessCards) {
      await addDoc(collection(db, 'businessCards'), card);
      console.log(`✅ Carte créée: ${card.name}`);
    }
    
    console.log('🎉 Données de test créées avec succès!');
    console.log('🔄 Rechargez le dashboard admin pour voir les données');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
  }
}

// Exécuter la fonction
createTestData();
