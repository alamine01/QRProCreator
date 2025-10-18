# 🚀 GUIDE DE DÉMARRAGE QRPRO

## ⚡ DÉMARRAGE RAPIDE

### Option 1: Script PowerShell (Recommandé)
```powershell
# Double-cliquez sur start-app.ps1 ou exécutez:
.\start-app.ps1
```

### Option 2: Script Batch
```cmd
# Double-cliquez sur start-app.bat ou exécutez:
start-app.bat
```

### Option 3: Manuel
```powershell
cd qrpro-app
npm run dev
```

## 🔧 RÉSOLUTION DES PROBLÈMES

### Si vous voyez "0 utilisateurs" et "0 commandes":
1. L'application utilise maintenant des **données de test** pour éviter les erreurs Firebase
2. Vous devriez voir **2 utilisateurs de test** et **2 commandes de test**
3. C'est normal - c'est pour éviter les erreurs de synchronisation

### Si l'application ne démarre pas:
1. Vérifiez que vous êtes dans le bon répertoire (`qrpro-app`)
2. Vérifiez que `package.json` existe
3. Exécutez `npm install` si nécessaire

## 📊 DONNÉES DE TEST

L'application affiche maintenant:
- **2 utilisateurs de test** (1 normal, 1 admin)
- **2 commandes de test** (1 en attente, 1 livrée)
- **Cartes de visite** → Données réelles Firebase
- **Documents** → Données réelles Firebase

## ✅ VÉRIFICATION

1. Ouvrez `http://localhost:3000`
2. Allez sur `/admin`
3. Vous devriez voir les données de test
4. Plus d'erreurs dans la console

## 🎯 PROCHAINES ÉTAPES

Une fois que l'application fonctionne avec les données de test, nous pourrons:
1. Reconnecter les vraies données Firebase
2. Corriger les problèmes de synchronisation
3. Optimiser les performances

**L'important est que l'application démarre sans erreurs !** 🚀

