// Script pour forcer la mise à jour du statut admin
// À exécuter dans la console du navigateur (F12)

async function forceAdminUpdate() {
  try {
    // Récupérer l'utilisateur actuel
    const { auth } = await import('@/lib/firebase');
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }
    
    console.log('👤 Utilisateur actuel:', user.email);
    
    // Mettre à jour le document dans Firestore
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    await updateDoc(userRef, {
      isAdmin: true,
      updatedAt: new Date()
    });
    
    console.log('✅ Statut admin mis à jour dans Firestore');
    console.log('🔄 Rechargez la page pour voir les changements');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter la fonction
forceAdminUpdate();
