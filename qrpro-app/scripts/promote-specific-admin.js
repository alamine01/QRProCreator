#!/usr/bin/env node

/**
 * Script pour promouvoir automatiquement bahmouhamedalamine@gmail.com en admin
 * Usage: node scripts/promote-specific-admin.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc, addDoc } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const TARGET_EMAIL = 'bahmouhamedalamine@gmail.com';

async function promoteSpecificAdmin() {
  try {
    console.log('🚀 Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log(`🔍 Recherche de l'utilisateur: ${TARGET_EMAIL}`);
    
    // Rechercher l'utilisateur par email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', TARGET_EMAIL));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`⚠️  Utilisateur ${TARGET_EMAIL} non trouvé`);
      console.log('📝 Création d\'un profil admin...');
      
      // Créer un profil admin pour cet email
      const adminProfile = {
        googleId: `admin_${Date.now()}`,
        email: TARGET_EMAIL,
        firstName: 'Mohamed',
        lastName: 'Alamine',
        profilePicture: '',
        profession: 'Administrateur',
        phone: '',
        phoneSecondary: '',
        phoneThird: '',
        phoneFourth: '',
        biography: 'Administrateur système',
        address: '',
        location: 'Sénégal',
        reviewLink: '',
        linkedin: '',
        whatsapp: '',
        instagram: '',
        twitter: '',
        snapchat: '',
        facebook: '',
        youtube: '',
        tiktok: '',
        profileSlug: 'mohamed-alamine-admin',
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(usersRef, adminProfile);
      console.log(`✅ Profil admin créé avec l'ID: ${docRef.id}`);
      console.log('🎉 Utilisateur promu administrateur avec succès!');
      
    } else {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      console.log(`✅ Utilisateur trouvé: ${userData.firstName} ${userData.lastName}`);
      console.log(`📧 Email: ${userData.email}`);
      console.log(`👑 Statut admin actuel: ${userData.isAdmin ? 'Oui' : 'Non'}`);

      if (userData.isAdmin) {
        console.log('ℹ️  L\'utilisateur est déjà administrateur');
        return;
      }

      // Promouvoir en admin
      console.log('🔧 Promotion en administrateur...');
      await updateDoc(doc(db, 'users', userDoc.id), {
        isAdmin: true,
        updatedAt: new Date()
      });

      console.log('✅ Utilisateur promu administrateur avec succès!');
    }

    console.log('🎉 Configuration terminée!');
    console.log('🌐 Vous pouvez maintenant accéder au dashboard admin');
    console.log('🔗 URL: http://localhost:3000/admin');
    console.log('📧 Email admin: bahmouhamedalamine@gmail.com');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration admin:', error);
    process.exit(1);
  }
}

// Vérifier les variables d'environnement
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error('❌ Variables d\'environnement Firebase non configurées');
  console.log('💡 Assurez-vous que votre fichier .env.local contient les clés Firebase');
  process.exit(1);
}

promoteSpecificAdmin();
