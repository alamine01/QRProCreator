// Script à exécuter dans la console du navigateur (F12)
// Copiez-collez ce code dans la console de votre navigateur

async function makeAdminNow() {
  try {
    console.log('🚀 Promotion de bahmouhamedalamine@gmail.com en admin...');
    
    // Importer Firebase
    const { getFirestore, collection, query, where, getDocs, updateDoc, doc, addDoc } = await import('firebase/firestore');
    const { auth } = await import('@/lib/firebase');
    
    const db = getFirestore();
    const targetEmail = 'bahmouhamedalamine@gmail.com';
    
    // Rechercher l'utilisateur
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', targetEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('📝 Création d\'un profil admin...');
      
      // Créer un profil admin
      const adminProfile = {
        googleId: `admin_${Date.now()}`,
        email: targetEmail,
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
      
    } else {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log(`✅ Utilisateur trouvé: ${userData.firstName} ${userData.lastName}`);
      console.log(`👑 Statut admin actuel: ${userData.isAdmin ? 'Oui' : 'Non'}`);
      
      if (userData.isAdmin) {
        console.log('ℹ️  L\'utilisateur est déjà administrateur');
        return;
      }
      
      // Promouvoir en admin
      await updateDoc(doc(db, 'users', userDoc.id), {
        isAdmin: true,
        updatedAt: new Date()
      });
      
      console.log('✅ Utilisateur promu administrateur!');
    }
    
    console.log('🎉 Configuration terminée!');
    console.log('🔄 Rechargez la page pour voir les changements');
    console.log('🌐 URL admin: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter la fonction
makeAdminNow();
