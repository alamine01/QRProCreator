# QRPro - Digital Business Card App

Une application moderne de cartes de visite numériques construite avec Next.js et Firebase.

## 🚀 Fonctionnalités

- **QR Code Dynamique** : Génération automatique de QR codes pour chaque profil
- **Profils Complets** : Informations de contact, réseaux sociaux, et coordonnées professionnelles
- **Design Responsive** : Interface optimisée pour tous les appareils
- **Export vCard** : Téléchargement des informations au format vCard
- **Authentification Google** : Connexion sécurisée avec Google OAuth
- **Interface Moderne** : Design avec effets de verre et gradients

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 14, React, TypeScript
- **Styling** : Tailwind CSS avec design system personnalisé
- **Backend** : Firebase (Firestore, Auth, Storage)
- **Authentication** : Firebase Auth avec Google provider
- **QR Code** : Bibliothèque qrcode pour génération côté client
- **Icons** : Lucide React

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd qrpro-app
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Firebase**
   - Créer un projet Firebase
   - Activer Authentication (Google provider)
   - Activer Firestore Database
   - Activer Storage
   - Copier la configuration dans `.env.local`

4. **Variables d'environnement**
   Créer un fichier `.env.local` avec :
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

## 🎨 Design System

### Couleurs Principales
- **Orange Principal** : `#F15A22` (primary-500)
- **Gradients** : Dégradés bleu-indigo pour les arrière-plans
- **Effets de Verre** : `backdrop-filter: blur(10px)` avec transparence

### Composants Clés
- **Navigation** : Barre de navigation avec effet de verre
- **Cartes** : Arrière-plan blanc avec ombres et coins arrondis
- **Boutons** : Style primaire orange avec effets de survol
- **Typographie** : Police Inter pour une lisibilité optimale

## 📱 Pages Principales

- **Accueil** (`/`) : Page d'accueil avec hero section et fonctionnalités
- **Tableau de Bord** (`/dashboard`) : Interface utilisateur pour gérer le profil
- **Profil Public** (`/pro/[slug]`) : Page publique partageable
- **Administration** (`/admin`) : Interface d'administration (utilisateurs admin)

## 🔧 Structure du Projet

```
src/
├── app/                 # Pages Next.js (App Router)
├── components/          # Composants React réutilisables
│   ├── layout/         # Composants de mise en page
│   └── sections/        # Sections de pages
├── contexts/           # Contextes React (Auth, etc.)
├── lib/               # Utilitaires et configuration
├── types/             # Types TypeScript
└── hooks/             # Hooks personnalisés
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Firebase Hosting
1. Build du projet : `npm run build`
2. Export statique : `npm run export`
3. Déployer avec Firebase CLI : `firebase deploy`

## 📊 Fonctionnalités à Implémenter

- [ ] Système d'authentification complet
- [ ] Gestion des profils utilisateur
- [ ] Génération de QR codes
- [ ] Upload d'images de profil
- [ ] Export vCard
- [ ] Interface d'administration
- [ ] Gestion des commandes NFC
- [ ] Support multilingue

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support, contactez-nous à :
- Email : contact@qrpro.com
- Documentation : [Lien vers la documentation]

---

Créé avec ❤️ par l'équipe QRPro