# 🎯 Guide d'Implémentation - QRPRO Events

## 📋 Vue d'Ensemble

Ce guide détaille l'implémentation de la fonctionnalité **QRPRO Events** qui permet aux structures d'organiser des événements et de gérer la liste de présence des invités via QR codes.

## 🎯 Fonctionnalités Principales

### 1. **Gestion des Événements**
- Création d'événements par l'admin
- Attribution de propriétaires d'événements
- Types d'événements : avec/sans pré-inscription
- Personnalisation des formulaires de check-in

### 2. **Système de Rôles**
- **Admin** : Création et gestion des événements
- **Propriétaire d'événement** : Gestion complète de son événement
- **Collaborateur** : Accès en lecture seule aux statistiques

### 3. **Check-in des Invités**
- QR codes dynamiques par événement
- Formulaires personnalisables
- Validation en temps réel
- Notifications automatiques

## 🏗️ Architecture Technique

### **Structure des Dossiers**
```
src/
├── app/
│   ├── admin/events/              # Interface admin événements
│   ├── api/admin/events/          # APIs admin événements
│   ├── api/event/                 # APIs publiques événements
│   └── event/[id]/checkin/        # Page de check-in publique
├── components/events/              # Composants événements
├── types/events.ts                # Types TypeScript événements
└── lib/events.ts                  # Logique métier événements
```

### **Base de Données Firebase**
```typescript
// Collection: events
interface Event {
  id: string;
  name: string;
  description: string;
  date: Timestamp;
  location: string;
  type: 'with_preregistration' | 'without_preregistration';
  ownerId: string; // ID du propriétaire
  collaborators: string[]; // IDs des collaborateurs
  formConfig: {
    fields: FormField[];
    colors: {
      primary: string;
      secondary: string;
      background: string;
    };
    logo?: string;
  };
  qrCode: string; // URL du QR code
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: event_checkins
interface EventCheckin {
  id: string;
  eventId: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    email?: string;
    company?: string;
    // Champs personnalisés
    [key: string]: any;
  };
  checkedInAt: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}
```

## 🚀 Plan d'Implémentation

### **Phase 1 : Structure de Base (1-2 jours)**

#### 1.1 Types TypeScript
```typescript
// src/types/events.ts
export interface Event {
  id: string;
  name: string;
  description: string;
  date: Timestamp;
  location: string;
  type: 'with_preregistration' | 'without_preregistration';
  ownerId: string;
  collaborators: string[];
  formConfig: EventFormConfig;
  qrCode: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EventFormConfig {
  fields: FormField[];
  colors: EventColors;
  logo?: string;
  welcomeMessage?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[]; // Pour les champs select
}

export interface EventColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface EventCheckin {
  id: string;
  eventId: string;
  guestInfo: Record<string, any>;
  checkedInAt: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}
```

#### 1.2 Fonctions Firebase
```typescript
// src/lib/events.ts
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>
export const getEventById = async (eventId: string): Promise<Event | null>
export const getAllEvents = async (): Promise<Event[]>
export const updateEvent = async (eventId: string, updates: Partial<Event>): Promise<boolean>
export const deleteEvent = async (eventId: string): Promise<boolean>
export const addEventCollaborator = async (eventId: string, userId: string): Promise<boolean>
export const removeEventCollaborator = async (eventId: string, userId: string): Promise<boolean>
export const getEventCheckins = async (eventId: string): Promise<EventCheckin[]>
export const addEventCheckin = async (checkinData: Omit<EventCheckin, 'id' | 'checkedInAt'>): Promise<string>
```

### **Phase 2 : Interface Admin (2-3 jours)**

#### 2.1 Page Admin Événements
```typescript
// src/app/admin/events/page.tsx
- Liste des événements
- Bouton "Créer un événement"
- Filtres par statut, propriétaire, date
- Actions : Modifier, Supprimer, Voir statistiques
```

#### 2.2 Modal Création/Modification
```typescript
// Composants :
- EventFormModal.tsx
- EventFormConfig.tsx
- ColorPicker.tsx
- UserSelector.tsx (pour les collaborateurs)
```

#### 2.3 APIs Admin
```typescript
// src/app/api/admin/events/route.ts
- GET : Récupérer tous les événements
- POST : Créer un événement
- PUT : Modifier un événement
- DELETE : Supprimer un événement

// src/app/api/admin/events/[id]/route.ts
- GET : Récupérer un événement spécifique
- PUT : Modifier un événement
- DELETE : Supprimer un événement
```

### **Phase 3 : Dashboard Utilisateur (1-2 jours)**

#### 3.1 Section Événements dans le Dashboard
```typescript
// src/app/dashboard/events/page.tsx
- Liste des événements assignés
- Bouton "Mes Événements"
- Accès aux statistiques
```

#### 3.2 Dashboard Événement
```typescript
// src/app/dashboard/events/[id]/page.tsx
- Statistiques en temps réel
- Liste des invités inscrits
- Recherche et filtres
- Export des données
- Gestion des collaborateurs
```

### **Phase 4 : Check-in Public (2-3 jours)**

#### 4.1 Page de Check-in
```typescript
// src/app/event/[id]/checkin/page.tsx
- Formulaire dynamique basé sur la config
- Validation en temps réel
- Design personnalisé selon les couleurs
- Confirmation de check-in
```

#### 4.2 APIs Publiques
```typescript
// src/app/api/event/[id]/checkin/route.ts
- POST : Enregistrer un check-in
- Validation des données
- Envoi de notifications
```

### **Phase 5 : Notifications et Intégrations (1-2 jours)**

#### 5.1 Système de Notifications
```typescript
// Notifications en temps réel
- Nouveau check-in
- Événement modifié
- Invitation collaborateur
```

#### 5.2 Intégrations
```typescript
// Email notifications
- Confirmation de check-in
- Rappels d'événement
- Notifications admin
```

## 🎨 Interface Utilisateur

### **Couleurs et Thème**
- Utilisation de Tailwind CSS
- Palette personnalisable par événement
- Design responsive
- Mode sombre/clair

### **Composants Réutilisables**
```typescript
// src/components/events/
- EventCard.tsx
- EventForm.tsx
- CheckinForm.tsx
- EventStats.tsx
- GuestList.tsx
- QRCodeGenerator.tsx
```

## 🔒 Sécurité

### **Règles Firebase**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Événements
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.token.admin == true);
    }
    
    // Check-ins
    match /event_checkins/{checkinId} {
      allow read: if request.auth != null;
      allow create: if true; // Public pour le check-in
    }
  }
}
```

### **Validation des Données**
- Validation côté client et serveur
- Sanitisation des entrées
- Protection CSRF
- Rate limiting

## 📊 Statistiques et Analytics

### **Métriques Disponibles**
- Nombre total d'invités
- Taux de participation
- Heure de pointe des arrivées
- Répartition par tranches horaires
- Données géographiques
- Export Excel/PDF

### **Dashboard Temps Réel**
- Graphiques animés
- Notifications push
- Mise à jour automatique
- Filtres avancés

## 🚀 Déploiement

### **Étapes de Déploiement**
1. **Développement local**
   ```bash
   npm run dev
   ```

2. **Tests**
   ```bash
   npm run test
   npm run build
   ```

3. **Déploiement**
   ```bash
   npm run deploy
   ```

### **Configuration Production**
- Variables d'environnement
- Configuration Firebase
- CDN pour les assets
- Monitoring et logs

## 📝 Checklist d'Implémentation

### **Phase 1 : Structure**
- [ ] Créer les types TypeScript
- [ ] Implémenter les fonctions Firebase
- [ ] Créer la structure des dossiers
- [ ] Configurer les règles de sécurité

### **Phase 2 : Admin**
- [ ] Page de gestion des événements
- [ ] Modal de création/modification
- [ ] APIs admin
- [ ] Tests unitaires

### **Phase 3 : Dashboard**
- [ ] Section événements utilisateur
- [ ] Dashboard événement individuel
- [ ] Gestion des collaborateurs
- [ ] Interface responsive

### **Phase 4 : Check-in**
- [ ] Page de check-in publique
- [ ] Formulaire dynamique
- [ ] Validation des données
- [ ] Design personnalisable

### **Phase 5 : Finalisation**
- [ ] Notifications
- [ ] Tests d'intégration
- [ ] Documentation
- [ ] Déploiement

## 🎯 Prochaines Étapes

1. **Commencer par la Phase 1** : Créer les types et fonctions de base
2. **Tester localement** : Vérifier que tout fonctionne
3. **Implémenter progressivement** : Une phase à la fois
4. **Tester à chaque étape** : Éviter les régressions
5. **Documenter** : Mettre à jour ce guide au fur et à mesure

## 📞 Support

Pour toute question ou problème :
- Vérifier les logs de la console
- Consulter la documentation Firebase
- Tester en mode développement
- Créer des issues GitHub si nécessaire

---

**Note** : Ce guide sera mis à jour au fur et à mesure de l'implémentation. Gardez-le à jour pour une référence complète.
