// Script pour promouvoir un utilisateur en admin
// À exécuter dans Firebase Console > Functions ou via un script Node.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  // Votre configuration Firebase
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function promoteUserToAdmin(userEmail: string) {
  try {
    // Trouver l'utilisateur par email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Utilisateur non trouvé');
      return;
    }
    
    // Promouvoir le premier utilisateur trouvé
    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), {
      isAdmin: true,
      updatedAt: new Date()
    });
    
    console.log(`Utilisateur ${userEmail} promu administrateur`);
  } catch (error) {
    console.error('Erreur lors de la promotion:', error);
  }
}

// Utilisation
promoteUserToAdmin('votre-email@gmail.com');
