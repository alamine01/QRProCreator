#!/usr/bin/env node

/**
 * Script de configuration admin pour QR Pro Creator
 * Usage: node scripts/setup-admin.js your-email@gmail.com
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');

// Configuration Firebase (remplacez par vos valeurs)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function setupAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Veuillez fournir un email: node scripts/setup-admin.js your-email@gmail.com');
    process.exit(1);
  }

  try {
    console.log('🚀 Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log(`🔍 Recherche de l'utilisateur: ${email}`);
    
    // Rechercher l'utilisateur par email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(`❌ Utilisateur avec l'email ${email} non trouvé dans la base de données`);
      console.log('💡 Assurez-vous que l\'utilisateur s\'est connecté au moins une fois');
      process.exit(1);
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    console.log(`✅ Utilisateur trouvé: ${userData.firstName} ${userData.lastName}`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`👑 Statut admin actuel: ${userData.isAdmin ? 'Oui' : 'Non'}`);

    if (userData.isAdmin) {
      console.log('ℹ️  L\'utilisateur est déjà administrateur');
      process.exit(0);
    }

    // Promouvoir en admin
    console.log('🔧 Promotion en administrateur...');
    await updateDoc(doc(db, 'users', userDoc.id), {
      isAdmin: true,
      updatedAt: new Date()
    });

    console.log('✅ Utilisateur promu administrateur avec succès!');
    console.log('🎉 Vous pouvez maintenant accéder au dashboard admin');
    console.log('🌐 URL: http://localhost:3000/admin');

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

setupAdmin();
