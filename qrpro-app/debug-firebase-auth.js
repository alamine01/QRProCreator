// Script pour vérifier la configuration Firebase
console.log('=== VÉRIFICATION FIREBASE AUTH ===');

// Vérifier les variables d'environnement
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('Variables d\'environnement:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✅ Définie' : '❌ Manquante'}`);
});

console.log('\n=== DOMAINES AUTORISÉS ===');
console.log('Domaines actuels:');
console.log('- localhost (développement)');
console.log('- qr-pro-creator-bnat.vercel.app (production)');
console.log('- qr-pro-créateur-bnat-git-main-bahs-projects-5dd8766c.vercel.app (preview)');

console.log('\n=== INSTRUCTIONS POUR CORRIGER ===');
console.log('1. Allez sur Firebase Console: https://console.firebase.google.com/');
console.log('2. Sélectionnez votre projet: studio-6374747103-d0730');
console.log('3. Allez dans Authentication > Settings > Authorized domains');
console.log('4. Ajoutez ces domaines:');
console.log('   - qr-pro-creator-bnat.vercel.app');
console.log('   - qr-pro-créateur-bnat-git-main-bahs-projects-5dd8766c.vercel.app');
console.log('   - localhost (si pas déjà présent)');
console.log('5. Sauvegardez les changements');

console.log('\n=== VÉRIFICATION NAVIGATEUR ===');
console.log('Vérifiez que:');
console.log('- Les popups ne sont pas bloqués');
console.log('- Les cookies sont autorisés');
console.log('- JavaScript est activé');
console.log('- Pas d\'extensions qui bloquent les popups');
