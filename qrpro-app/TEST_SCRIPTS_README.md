# Scripts de Test pour les Statistiques

Ce dossier contient plusieurs scripts pour simuler des scans QR et des téléchargements afin de tester la page de statistiques.

## 📋 Prérequis

1. **Serveur Next.js démarré** : `npm run dev`
2. **Document existant** : Avoir au moins un document dans votre base Firebase
3. **Node.js** : Version 16+ recommandée

## 🚀 Scripts Disponibles

### 1. `simple-test.js` (Recommandé)
Script le plus simple qui utilise directement les APIs existantes.

```bash
node simple-test.js
```

**Avantages :**
- ✅ Aucune dépendance Firebase
- ✅ Utilise les APIs existantes
- ✅ Génère des données réalistes
- ✅ Facile à utiliser

### 2. `test-api-simulator.js`
Script intermédiaire avec plus de contrôle.

```bash
node test-api-simulator.js
```

### 3. `test-stats-simulator.js`
Script avancé qui écrit directement dans Firebase.

```bash
# Installer les dépendances Firebase si nécessaire
npm install firebase

node test-stats-simulator.js
```

## ⚙️ Configuration

### Modifier l'ID du document
Ouvrez le script et changez cette ligne :
```javascript
const TEST_DOCUMENT_ID = "itzoacB5xwRFvGR3Az2u"; // Remplacez par votre ID
```

### Obtenir un ID de document
1. Allez sur `/admin/documents`
2. Copiez l'ID d'un document existant
3. Remplacez `TEST_DOCUMENT_ID` dans le script

## 📊 Résultats Attendus

Après avoir exécuté un script, vous devriez voir :

### Dans la console :
```
🚀 Génération de données de test...
🔲 Simulation de 12 scans QR...
✅ Scan QR 1/12
✅ Scan QR 2/12
...
📥 Simulation de 6 téléchargements...
✅ Téléchargement 1/6
...
🎉 Génération terminée !
```

### Dans la page de statistiques :
- **Scans QR** : Nombre de scans simulés
- **Téléchargements** : Nombre de téléchargements simulés
- **Historique** : Liste des scans et téléchargements avec dates/heures
- **Barres de progression** : Visuellement mises à jour

## 🔧 Dépannage

### Erreur "Serveur non accessible"
```bash
# Vérifiez que le serveur est démarré
npm run dev
```

### Erreur "Document non trouvé"
1. Vérifiez que l'ID du document est correct
2. Assurez-vous que le document existe dans `/admin/documents`

### Erreur de permissions Firebase
- Vérifiez vos règles Firebase
- Assurez-vous que l'authentification fonctionne

## 📈 Données Générées

Les scripts génèrent des données réalistes :
- **User Agents** : Navigateurs variés (Chrome, Safari, Firefox, Mobile)
- **Adresses IP** : IPs locales simulées
- **Dates** : Réparties sur les 30 derniers jours
- **Localisations** : Villes françaises

## 🎯 Utilisation Recommandée

1. **Démarrez le serveur** : `npm run dev`
2. **Exécutez le script** : `node simple-test.js`
3. **Ouvrez la page de statistiques** dans votre navigateur
4. **Observez les données** mises à jour en temps réel

## 📝 Notes

- Les scripts ajoutent des données, ils ne les suppriment pas
- Vous pouvez exécuter les scripts plusieurs fois
- Les données sont persistantes dans Firebase
- Pour nettoyer, supprimez manuellement les entrées dans Firebase Console
