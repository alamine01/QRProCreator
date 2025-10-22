import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider, Auth, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, orderBy, limit, deleteDoc, Firestore, Timestamp, increment } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { User, Order, Product, OrderItem, CustomerInfo, PaymentInfo } from '@/types';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from './email';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB0KphmN9-QMDdn7lRjicz4QbJVrX99mnc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-6374747103-d0730.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-6374747103-d0730",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-6374747103-d0730.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "541216504423",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:541216504423:web:dfc96bf03a35a0def972c2",
};

// Debug: Log the config to see what's being used
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'undefined',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Configuration du Google Provider avec les bonnes permissions
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Fonction de connexion Google
export const signInWithGoogle = async () => {
  try {
    console.log('Tentative de connexion Google...');
    console.log('Auth domain:', firebaseConfig.authDomain);
    console.log('Current domain:', window.location.hostname);
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Connexion Google réussie:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('Erreur de connexion Google:', error);
    
    // Gestion spécifique des erreurs
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Connexion annulée par l\'utilisateur');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup bloqué par le navigateur. Veuillez autoriser les popups pour ce site.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Domaine non autorisé. Veuillez contacter l\'administrateur.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Connexion Google non activée. Veuillez contacter l\'administrateur.');
    }
    
    throw error;
  }
};

// Fonction de connexion avec email/password
export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Erreur de connexion email/password:', error);
    throw error;
  }
};

// Fonction d'inscription avec email/password
export const createUserWithEmailPassword = async (email: string, password: string, userData?: { firstName: string; lastName: string; phone: string }) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Si des données utilisateur sont fournies, les stocker temporairement pour le contexte
    if (userData) {
      // Stocker les données dans sessionStorage pour que le contexte puisse les récupérer
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingUserData', JSON.stringify(userData));
      }
    }
    
    return result.user;
  } catch (error) {
    console.error('Erreur d\'inscription email/password:', error);
    throw error;
  }
};

// Fonction de changement de mot de passe
export const changeUserPassword = async (currentPassword: string, newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Utilisateur non connecté');
    }

    // Réauthentifier l'utilisateur avec le mot de passe actuel
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Changer le mot de passe
    await updatePassword(user, newPassword);
    return true;
  } catch (error) {
    console.error('Erreur de changement de mot de passe:', error);
    throw error;
  }
};

// Fonction pour sauvegarder les données utilisateur
export const saveUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
    console.log('Profil utilisateur sauvegardé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil:', error);
    throw error;
  }
};

// Fonction pour récupérer les données utilisateur par slug
export const getUserProfileBySlug = async (slug: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('profileSlug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    } else {
      console.log('Aucun profil utilisateur trouvé avec ce slug:', slug);
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du profil par slug:', error);
    throw error;
  }
};

// Fonction pour récupérer les données utilisateur
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    } else {
      console.log('Aucun profil utilisateur trouvé');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
};

// Fonction pour créer un profil utilisateur initial
export const createUserProfile = async (userId: string, userData: User) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, userData);
    console.log('Profil utilisateur créé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la création du profil:', error);
    throw error;
  }
};

// Fonction pour uploader une image de profil
export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Image de profil uploadée avec succès');
    return downloadURL;
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    throw error;
  }
};

// Interfaces pour les statistiques
export interface ScanData {
  id: string;
  userId: string;
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  country: string;
  city: string;
  district: string;
  ip: string;
  isUnique: boolean;
  userAgent: string;
}

export interface StatsData {
  totalScans: number;
  uniqueScans: number;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  topCountries: { country: string; count: number }[];
  topDevices: { device: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  recentScans: ScanData[];
  // Nouvelles statistiques pour les téléchargements vCard
  totalVCardDownloads: number;
  uniqueVCardDownloads: number;
  vCardDownloadsToday: number;
  vCardDownloadsThisWeek: number;
  vCardDownloadsThisMonth: number;
  recentVCardDownloads: ScanData[];
}

// Fonction pour enregistrer un scan
export const recordScan = async (userId: string, scanData: Partial<ScanData>) => {
  try {
    // Vérifier que userId est valide
    if (!userId || userId.trim() === '') {
      throw new Error('userId est requis pour enregistrer un scan');
    }

    const scanRef = await addDoc(collection(db, 'scans'), {
      userId,
      timestamp: new Date().toISOString(),
      ...scanData,
      createdAt: new Date()
    });
    console.log('Scan enregistré avec succès:', scanRef.id);
    return scanRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du scan:', error);
    throw error;
  }
};

// Fonction pour enregistrer un téléchargement de vCard
export const recordVCardDownload = async (userId: string, downloadData: Partial<ScanData>) => {
  try {
    // Vérifier que userId est valide
    if (!userId || userId.trim() === '') {
      throw new Error('userId est requis pour enregistrer un téléchargement vCard');
    }

    // Pour l'instant, considérer tous les téléchargements comme uniques
    // TODO: Implémenter une logique de déduplication côté serveur si nécessaire
    const isUnique = true;

    const downloadRef = await addDoc(collection(db, 'vcard_downloads'), {
      userId,
      timestamp: new Date().toISOString(),
      type: 'vcard_download',
      isUnique,
      ...downloadData,
      createdAt: new Date()
    });
    console.log('Téléchargement vCard enregistré avec succès:', downloadRef.id);
    return downloadRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du téléchargement vCard:', error);
    throw error;
  }
};

// Fonction pour mettre à jour le mot de passe dans Firebase Auth ET Firestore
export const updateUserPasswordComplete = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    console.log('Tentative de changement de mot de passe pour:', currentUser.email);
    console.log('Mot de passe actuel fourni:', currentPassword);

    // Créer les credentials pour la réauthentification
    const credential = EmailAuthProvider.credential(
      currentUser.email!,
      currentPassword
    );

    // Réauthentifier l'utilisateur avec l'ancien mot de passe
    await reauthenticateWithCredential(currentUser, credential);

    // Mettre à jour le mot de passe dans Firebase Auth
    await updatePassword(currentUser, newPassword);

    // Mettre à jour le mot de passe hashé dans Firestore
    const { hashPassword } = await import('./auth');
    const newHashedPassword = await hashPassword(newPassword);

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      passwordHash: newHashedPassword,
      tempPassword: null, // Supprimer le mot de passe temporaire
      mustChangePassword: false, // Le mot de passe a été changé
      updatedAt: new Date(), // Utiliser new Date() au lieu de serverTimestamp()
    });

    console.log('Mot de passe mis à jour avec succès dans Firebase Auth et Firestore');
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    
    let errorMessage = 'Erreur lors de la mise à jour du mot de passe';
    if (error.code === 'auth/wrong-password') {
      errorMessage = 'Mot de passe actuel incorrect';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Mot de passe temporaire incorrect. Vérifiez le mot de passe affiché ci-dessus.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Le nouveau mot de passe est trop faible';
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage = 'Veuillez vous reconnecter pour changer votre mot de passe';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Fonction spéciale pour les utilisateurs assignés à des autocollants
export const updateStickerUserPassword = async (
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    console.log('Changement de mot de passe pour utilisateur assigné:', currentUser.email);

    // Pour les utilisateurs assignés à des autocollants, on peut directement mettre à jour le mot de passe
    // car ils viennent de se connecter avec leur mot de passe temporaire
    await updatePassword(currentUser, newPassword);

    // Mettre à jour le mot de passe hashé dans Firestore
    const { hashPassword } = await import('./auth');
    const newHashedPassword = await hashPassword(newPassword);

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      passwordHash: newHashedPassword,
      tempPassword: null, // Supprimer le mot de passe temporaire
      mustChangePassword: false, // Le mot de passe a été changé
      updatedAt: new Date(),
    });

    console.log('Mot de passe mis à jour avec succès pour utilisateur assigné');
    
    // Forcer une mise à jour du contexte d'authentification
    // En rechargeant la page pour que le contexte soit mis à jour
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    
    let errorMessage = 'Erreur lors de la mise à jour du mot de passe';
    if (error.code === 'auth/weak-password') {
      errorMessage = 'Le nouveau mot de passe est trop faible';
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage = 'Veuillez vous reconnecter pour changer votre mot de passe';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Fonction pour récupérer les statistiques d'un utilisateur - SÉCURISÉE
export const getUserStats = async (userId: string, requestingUserId: string, period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<StatsData> => {
  try {
    // Vérifier que userId est valide
    if (!userId || userId.trim() === '') {
      throw new Error('userId est requis');
    }

    // Vérification de sécurité : l'utilisateur ne peut accéder qu'à ses propres statistiques
    if (userId !== requestingUserId) {
      // Vérifier si l'utilisateur demandeur est admin
      const requestingUserDoc = await getDoc(doc(db, 'users', requestingUserId));
      if (!requestingUserDoc.exists() || !requestingUserDoc.data().isAdmin) {
        throw new Error('Accès non autorisé - Vous ne pouvez accéder qu\'à vos propres statistiques');
      }
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Récupérer tous les scans de l'utilisateur (sans orderBy pour éviter l'index)
    const scansQuery = query(
      collection(db, 'scans'),
      where('userId', '==', userId)
    );
    
    const scansSnapshot = await getDocs(scansQuery);
    const allScans = scansSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ScanData[];
    
    // Trier manuellement par timestamp (plus récent en premier)
    allScans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Filtrer par période
    const periodScans = allScans.filter(scan => 
      new Date(scan.timestamp) >= startDate
    );

    // Calculer les statistiques
    const totalScans = allScans.length;
    const uniqueScans = allScans.filter(scan => scan.isUnique).length;
    const scansToday = allScans.filter(scan => {
      const scanDate = new Date(scan.timestamp);
      const today = new Date();
      return scanDate.getDate() === today.getDate() &&
             scanDate.getMonth() === today.getMonth() &&
             scanDate.getFullYear() === today.getFullYear();
    }).length;

    const scansThisWeek = periodScans.length;
    const scansThisMonth = allScans.filter(scan => {
      const scanDate = new Date(scan.timestamp);
      return scanDate.getMonth() === now.getMonth() &&
             scanDate.getFullYear() === now.getFullYear();
    }).length;

    // Top pays
    const countryCount: { [key: string]: number } = {};
    allScans.forEach(scan => {
      if (scan.country) {
        countryCount[scan.country] = (countryCount[scan.country] || 0) + 1;
      }
    });
    const topCountries = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top appareils
    const deviceCount: { [key: string]: number } = {};
    allScans.forEach(scan => {
      if (scan.device) {
        deviceCount[scan.device] = (deviceCount[scan.device] || 0) + 1;
      }
    });
    const topDevices = Object.entries(deviceCount)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Distribution par heure
    const hourlyCount: { [key: number]: number } = {};
    allScans.forEach(scan => {
      const hour = new Date(scan.timestamp).getHours();
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    });
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyCount[i] || 0
    }));

    // Récupérer tous les téléchargements vCard de l'utilisateur
    const downloadsQuery = query(
      collection(db, 'vcard_downloads'),
      where('userId', '==', userId)
    );
    
    const downloadsSnapshot = await getDocs(downloadsQuery);
    const allDownloads = downloadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ScanData[];

    // Trier par timestamp décroissant
    allDownloads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculer les statistiques des téléchargements vCard
    const totalVCardDownloads = allDownloads.length;
    const uniqueVCardDownloads = allDownloads.filter(download => download.isUnique).length;
    
    const vCardDownloadsToday = allDownloads.filter(download => {
      const downloadDate = new Date(download.timestamp);
      const today = new Date();
      return downloadDate.getDate() === today.getDate() &&
             downloadDate.getMonth() === today.getMonth() &&
             downloadDate.getFullYear() === today.getFullYear();
    }).length;
    
    const vCardDownloadsThisWeek = allDownloads.filter(download => 
      new Date(download.timestamp) >= startDate
    ).length;
    
    const vCardDownloadsThisMonth = allDownloads.filter(download => {
      const downloadDate = new Date(download.timestamp);
      return downloadDate.getMonth() === now.getMonth() &&
             downloadDate.getFullYear() === now.getFullYear();
    }).length;

    // Scans récents
    const recentScans = allScans.slice(0, 10);
    const recentVCardDownloads = allDownloads.slice(0, 10);

    return {
      totalScans,
      uniqueScans,
      scansToday,
      scansThisWeek,
      scansThisMonth,
      topCountries,
      topDevices,
      hourlyDistribution,
      recentScans,
      // Nouvelles statistiques pour les téléchargements vCard
      totalVCardDownloads,
      uniqueVCardDownloads,
      vCardDownloadsToday,
      vCardDownloadsThisWeek,
      vCardDownloadsThisMonth,
      recentVCardDownloads
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Fonction pour détecter les informations de l'appareil et de la localisation
export const detectDeviceInfo = async () => {
  const userAgent = navigator.userAgent;
  
  // Détection de l'appareil
  let device = 'Desktop';
  let os = 'Unknown';
  
  if (/iPhone/i.test(userAgent)) {
    device = 'iPhone';
    os = 'iOS';
  } else if (/iPad/i.test(userAgent)) {
    device = 'iPad';
    os = 'iPadOS';
  } else if (/Android/i.test(userAgent)) {
    device = 'Android';
    os = 'Android';
    if (/Samsung/i.test(userAgent)) {
      device = 'Samsung Galaxy';
    } else if (/Huawei/i.test(userAgent)) {
      device = 'Huawei';
    } else if (/Xiaomi/i.test(userAgent)) {
      device = 'Xiaomi';
    }
  }
  
  // Détection du navigateur
  let browser = 'Unknown';
  if (/Chrome/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/Firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Edge/i.test(userAgent)) {
    browser = 'Edge';
  }
  
  // Géolocalisation DISCRÈTE - API IP gratuite (pas de demande d'autorisation)
  let location = 'Unknown';
  let country = 'Unknown';
  let city = 'Unknown';
  let district = 'Unknown';
  
  try {
    // Utiliser une API IP gratuite pour obtenir des informations détaillées
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      country = data.country_name || 'Unknown';
      city = data.city || 'Unknown';
      
      // Essayer d'obtenir le quartier/district si disponible
      district = data.district || data.region || data.state || 'Unknown';
      
      // Construire la localisation avec le maximum d'informations disponibles
      if (district && district !== 'Unknown' && district !== city) {
        location = `${district}, ${city}, ${country}`;
      } else if (city && city !== 'Unknown') {
        location = `${city}, ${country}`;
      } else {
        location = country;
      }
    }
  } catch (error) {
    // Silencieux - pas de données de localisation disponibles
    console.log('Localisation par IP non disponible');
  }
  
  // Détection de scan unique (basé sur localStorage)
  const lastScanTime = localStorage.getItem('last_qr_scan');
  const isUnique = !lastScanTime || (Date.now() - parseInt(lastScanTime)) > 300000; // 5 minutes
  
  if (isUnique) {
    localStorage.setItem('last_qr_scan', Date.now().toString());
  }
  
  return {
    device,
    browser,
    os,
    userAgent,
    location,
    country,
    city,
    district,
    isUnique
  };
};

// ===== FONCTIONS POUR LE SYSTÈME DE COMMANDES =====

// Produits disponibles
export const PRODUCTS: Product[] = [
  {
    id: 'nfc-card',
    name: 'Carte NFC',
    description: 'Carte NFC personnalisée avec votre QR code',
    price: 20000,
    currency: 'FCFA',
    category: 'nfc',
    isActive: true
  },
  {
    id: 'qr-stickers',
    name: 'Autocollants QR Code',
    description: 'Pack de 3 autocollants avec votre QR code',
    price: 3000,
    currency: 'FCFA',
    category: 'stickers',
    isActive: true
  },
  {
    id: 'complete-pack',
    name: 'Pack Complet',
    description: 'Carte NFC + 3 autocollants QR Code (Économisez 1,500 FCFA)',
    price: 21500,
    currency: 'FCFA',
    category: 'pack',
    isActive: true
  }
];

// Générer un numéro de commande unique
const generateOrderNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QR${year}${month}${day}${random}`;
};

// Créer une nouvelle commande
export const createOrder = async (
  userId: string,
  items: OrderItem[],
  customerInfo: CustomerInfo,
  paymentInfo: PaymentInfo,
  notes?: string
): Promise<string> => {
  try {
    const orderNumber = generateOrderNumber();
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    const orderData: Omit<Order, 'id'> = {
      userId,
      orderNumber,
      items,
      customerInfo,
      paymentInfo,
      totalAmount,
      currency: 'FCFA',
      status: 'pending',
      notes,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    // Envoyer une notification email de confirmation (ne pas bloquer si ça échoue)
    try {
      await sendOrderConfirmationEmailToCustomer(
        orderData.customerInfo.email, 
        orderNumber, 
        totalAmount,
        `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
        items
      );
    } catch (emailError) {
      console.warn('⚠️ Email de confirmation échoué, mais commande créée:', emailError);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    throw error;
  }
};

// Récupérer les commandes d'un utilisateur
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    // Vérifier que userId est valide
    if (!userId || userId.trim() === '') {
      throw new Error('userId est requis');
    }

    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      } as Order);
    });
    
    // Tri manuel par date de création (plus récent en premier)
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt as any) : new Date(0));
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt as any) : new Date(0));
      return dateB.getTime() - dateA.getTime();
    });
    
    return orders;
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    throw error;
  }
};

// Récupérer une commande par ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    
    if (orderDoc.exists()) {
      return {
        id: orderDoc.id,
        ...orderDoc.data()
      } as Order;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    throw error;
  }
};

// Mettre à jour le statut d'une commande
// NOUVELLE FONCTION ULTRA-SIMPLE ET SÉCURISÉE
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  notes?: string,
  cancellationReason?: string
): Promise<{ success: boolean; emailSent: boolean; error?: string }> => {
  try {
    console.log('🔥 [FIREBASE] Mise à jour statut - Commande ID:', orderId, 'Nouveau statut:', status);
    
    // 1. Vérifier que la commande existe AVANT de la modifier
    const orderRef = doc(db, 'orders', orderId);
    const orderSnapshot = await getDoc(orderRef);
    
    if (!orderSnapshot.exists()) {
      console.error('❌ [FIREBASE] Commande non trouvée:', orderId);
      return { success: false, emailSent: false, error: 'Commande non trouvée' };
    }
    
    const currentOrder = orderSnapshot.data() as Order;
    console.log('✅ [FIREBASE] Commande trouvée - Statut actuel:', currentOrder.status);
    
    // 2. Préparer UNIQUEMENT les données à mettre à jour
    const updateData: any = {
      status: status,
      updatedAt: new Date()
    };
    
    // 3. Ajouter les champs conditionnels
    if (notes) {
      updateData.notes = notes;
    }
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
    }
    
    console.log('📝 [FIREBASE] Données à mettre à jour:', updateData);
    
    // 4. Mise à jour ATOMIQUE - UNE SEULE COMMANDE
    await updateDoc(orderRef, updateData);
    console.log('✅ [FIREBASE] Mise à jour effectuée pour la commande:', orderId);
    
    // 5. Vérification IMMÉDIATE que seule cette commande a été modifiée
    const verificationSnapshot = await getDoc(orderRef);
    const updatedOrder = verificationSnapshot.data() as Order;
    
    if (updatedOrder.status !== status) {
      console.error('❌ [FIREBASE] ÉCHEC - Le statut n\'a pas été mis à jour correctement');
      return { success: false, emailSent: false, error: 'Échec de la mise à jour du statut' };
    }
    
    console.log('✅ [FIREBASE] VÉRIFICATION RÉUSSIE - Statut mis à jour:', updatedOrder.status);
    
    // 6. Email (optionnel - ne pas faire échouer la mise à jour)
    let emailSent = false;
    try {
      if (currentOrder.lastStatusNotified !== status) {
        await sendOrderStatusUpdateEmailToCustomer(
          currentOrder.customerInfo.email, 
          currentOrder.orderNumber, 
          status,
          `${currentOrder.customerInfo.firstName} ${currentOrder.customerInfo.lastName}`
        );
        
        // Mettre à jour le tracking de l'email
        await updateDoc(orderRef, {
          lastStatusNotified: status,
          lastStatusEmailSentAt: new Date()
        });
        
        emailSent = true;
        console.log('✅ [FIREBASE] Email envoyé pour la commande:', orderId);
      } else {
        emailSent = true; // Déjà envoyé
        console.log('⚠️ [FIREBASE] Email déjà envoyé pour ce statut');
      }
    } catch (emailError) {
      console.warn('⚠️ [FIREBASE] Email non envoyé mais statut mis à jour:', emailError);
      emailSent = false;
    }
    
    return { success: true, emailSent };
    
  } catch (error) {
    console.error('❌ [FIREBASE] ERREUR CRITIQUE lors de la mise à jour:', error);
    return { 
      success: false, 
      emailSent: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
};

// Annuler une commande (seulement si en attente) - VERSION SIMPLIFIÉE
export const cancelOrder = async (orderId: string, reason: string): Promise<void> => {
  try {
    console.log('🚫 [FIREBASE] Annulation commande:', orderId, 'Raison:', reason);
    
    // Vérifier que la commande existe
    const orderRef = doc(db, 'orders', orderId);
    const orderSnapshot = await getDoc(orderRef);
    
    if (!orderSnapshot.exists()) {
      throw new Error('Commande non trouvée');
    }
    
    const order = orderSnapshot.data() as Order;
    
    if (order.status !== 'pending') {
      throw new Error('Seules les commandes en attente peuvent être annulées');
    }
    
    // Mise à jour directe pour annulation
    await updateDoc(orderRef, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason,
      updatedAt: new Date()
    });
    
    console.log('✅ [FIREBASE] Commande annulée:', orderId);
  } catch (error) {
    console.error('❌ [FIREBASE] Erreur annulation:', error);
    throw error;
  }
};

// Fonction pour envoyer un email de confirmation de commande
const sendOrderConfirmationEmailToCustomer = async (email: string, orderNumber: string, totalAmount: number, customerName: string, orderItems: OrderItem[]): Promise<void> => {
  try {
    const items = orderItems.map(item => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.unitPrice
    }));
    
    await sendOrderConfirmationEmail(email, orderNumber, totalAmount, customerName, items);
    console.log('✅ Email de confirmation envoyé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
    console.warn('⚠️ L\'email de confirmation n\'a pas pu être envoyé, mais la commande sera créée');
    // Ne pas relancer l'erreur pour ne pas bloquer la création de commande
  }
};

// Fonction pour envoyer un email de mise à jour de statut
const sendOrderStatusUpdateEmailToCustomer = async (email: string, orderNumber: string, status: Order['status'], customerName: string): Promise<void> => {
  try {
    console.log('📧 [SERVEUR] Email de changement de statut désactivé - on envoie seulement des confirmations');
    // Pour simplifier, on n'envoie plus d'emails de changement de statut
    // L'utilisateur recevra seulement l'email de confirmation initial
    console.log('✅ [SERVEUR] Pas d\'email de changement de statut envoyé (fonctionnalité désactivée)');
  } catch (error) {
    console.error('❌ [SERVEUR] Erreur lors de l\'envoi de l\'email de mise à jour:', error);
    console.error('❌ [SERVEUR] Détails de l\'erreur:', {
      errorType: typeof error,
      errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
      errorStack: error instanceof Error ? error.stack : undefined,
      email,
      orderNumber,
      status,
      customerName
    });
    console.warn('⚠️ [SERVEUR] L\'email de mise à jour n\'a pas pu être envoyé, mais le statut a été mis à jour');
    // Ne pas relancer l'erreur pour ne pas bloquer la mise à jour de statut
  }
};

// ===== FONCTIONS POUR L'ADMINISTRATION =====

// Récupérer tous les utilisateurs (admin seulement)
export const getAllUsers = async (limitCount?: number): Promise<User[]> => {
  try {
    let usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    if (limitCount) {
      usersQuery = query(usersQuery, limit(limitCount));
    }

    const snapshot = await getDocs(usersQuery);
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    return users;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// Récupérer toutes les commandes (admin seulement)
export const getAllOrders = async (limitCount?: number, statusFilter?: string): Promise<Order[]> => {
  try {
    let ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    if (statusFilter && statusFilter !== 'all') {
      ordersQuery = query(ordersQuery, where('status', '==', statusFilter));
    }

    if (limitCount) {
      ordersQuery = query(ordersQuery, limit(limitCount));
    }

    const snapshot = await getDocs(ordersQuery);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];

    return orders;
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    throw error;
  }
};

// Récupérer toutes les cartes de visite (admin seulement)
export const getAllBusinessCards = async (limitCount?: number): Promise<any[]> => {
  try {
    let cardsQuery = query(
      collection(db, 'businessCards'),
      orderBy('createdAt', 'desc')
    );

    if (limitCount) {
      cardsQuery = query(cardsQuery, limit(limitCount));
    }

    const snapshot = await getDocs(cardsQuery);
    const cards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return cards;
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes de visite:', error);
    throw error;
  }
};

// Créer une carte de visite (admin seulement)
export const createBusinessCard = async (cardData: any): Promise<string> => {
  try {
    const uniqueId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const businessCardData = {
      ...cardData,
      uniqueId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'businessCards'), businessCardData);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la carte de visite:', error);
    throw error;
  }
};

// Mettre à jour une carte de visite (admin seulement)
export const updateBusinessCard = async (cardId: string, cardData: any): Promise<any> => {
  try {
    console.log('🔥 Firebase: Mise à jour de la carte', cardId);
    console.log('📋 Données à sauvegarder:', cardData);
    
    await updateDoc(doc(db, 'businessCards', cardId), {
      ...cardData,
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Firebase: Document mis à jour avec succès');
    
    // Retourner la carte mise à jour
    const cardDoc = await getDoc(doc(db, 'businessCards', cardId));
    if (cardDoc.exists()) {
      const updatedData = {
        id: cardDoc.id,
        ...cardDoc.data()
      };
      console.log('📄 Firebase: Carte récupérée après mise à jour:', updatedData);
      return updatedData;
    }
    throw new Error('Carte non trouvée après mise à jour');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte de visite:', error);
    throw error;
  }
};

// Supprimer une carte de visite (admin seulement)
export const deleteBusinessCard = async (cardId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'businessCards', cardId));
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte de visite:', error);
    throw error;
  }
};

// Mettre à jour le statut admin d'un utilisateur
export const updateUserAdminStatus = async (userId: string, isAdmin: boolean): Promise<void> => {
  try {
    // Vérifier d'abord si l'utilisateur existe
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error(`Utilisateur ${userId} non trouvé`);
    }
    
    // Récupérer les données existantes et mettre à jour seulement les champs nécessaires
    const userData = userDoc.data();
    const updatedData = {
      ...userData,
      isAdmin,
      updatedAt: Timestamp.now()
    };
    
    // Utiliser setDoc avec merge pour éviter de perdre des données
    await setDoc(doc(db, 'users', userId), updatedData, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut admin:', error);
    throw error;
  }
};

// Récupérer les statistiques générales (admin seulement)
export const getAdminStats = async () => {
  try {
    let totalUsers = 0;
    let totalOrders = 0;
    let totalBusinessCards = 0;
    let pendingOrders = 0;
    let totalRevenue = 0;
    let deliveredOrdersCount = 0;

    // Compter les utilisateurs
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      totalUsers = usersSnapshot.size;
    } catch (error) {
      console.log('Collection users non trouvée ou erreur:', error);
    }

    // Compter les commandes
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      totalOrders = ordersSnapshot.size;

      // Compter les commandes en attente
      const pendingOrdersQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'pending')
      );
      const pendingOrdersSnapshot = await getDocs(pendingOrdersQuery);
      pendingOrders = pendingOrdersSnapshot.size;

    // Calculer le revenu total et compter les commandes livrées
    ordersSnapshot.forEach((doc) => {
      const order = doc.data() as Order;
      if (order.status === 'delivered') {
        totalRevenue += order.totalAmount;
        deliveredOrdersCount++;
      }
    });
    } catch (error) {
      console.log('Collection orders non trouvée ou erreur:', error);
    }

    // Compter les cartes de visite
    try {
      const cardsSnapshot = await getDocs(collection(db, 'businessCards'));
      totalBusinessCards = cardsSnapshot.size;
    } catch (error) {
      console.log('Collection businessCards non trouvée ou erreur:', error);
    }

    // Calculer le panier moyen (basé sur les commandes livrées uniquement)
    const averageOrderValue = deliveredOrdersCount > 0 ? totalRevenue / deliveredOrdersCount : 0;

    return {
      totalUsers,
      totalOrders,
      totalBusinessCards,
      pendingOrders,
      totalRevenue,
      averageOrderValue,
      userGrowth: 0, // À implémenter avec des données historiques
      orderGrowth: 0, // À implémenter avec des données historiques
      revenueGrowth: 0 // À implémenter avec des données historiques
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques admin:', error);
    throw error;
  }
};

// ===== FONCTIONS POUR LES DOCUMENTS =====

// Récupérer tous les documents (admin seulement)
export const getAllDocuments = async (limitCount?: number): Promise<any[]> => {
  try {
    console.log('Tentative de récupération des documents...');
    
    // Essayer d'abord avec orderBy, puis sans si ça échoue
    try {
      let docsQuery = query(
        collection(db, 'documents'),
        orderBy('uploadedAt', 'desc')
      );

      if (limitCount) {
        docsQuery = query(docsQuery, limit(limitCount));
      }

      const snapshot = await getDocs(docsQuery);
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Documents récupérés avec orderBy:', documents.length);
      return documents;
    } catch (orderByError) {
      console.log('orderBy échoué, tentative sans orderBy:', orderByError);
      
      // Essayer sans orderBy
      let docsQuery = query(collection(db, 'documents'));
      
      if (limitCount) {
        docsQuery = query(docsQuery, limit(limitCount));
      }

      const snapshot = await getDocs(docsQuery);
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Documents récupérés sans orderBy:', documents.length);
      return documents;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    
    // Si la collection n'existe pas encore, retourner un tableau vide
    if (error instanceof Error && (
      error.message.includes('collection') || 
      error.message.includes('not found') ||
      error.message.includes('permission')
    )) {
      console.log('Collection documents n\'existe pas encore ou problème de permissions, retour d\'un tableau vide');
      return [];
    }
    
    throw error;
  }
};

// Créer un document (admin seulement)
export const createDocument = async (documentData: any): Promise<string> => {
  try {
    console.log('🔥 Firebase: Début création document');
    console.log('📋 Données reçues:', JSON.stringify(documentData, null, 2));
    
    const uniqueId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 ID unique généré:', uniqueId);
    
    const documentRecord = {
      ...documentData,
      uniqueId,
      uploadedAt: Timestamp.now(),
      downloadCount: 0,
      isActive: true
    };

    console.log('💾 Enregistrement à créer:', JSON.stringify(documentRecord, null, 2));
    const docRef = await addDoc(collection(db, 'documents'), documentRecord);
    console.log('✅ Document créé avec ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur lors de la création du document:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};

// Mettre à jour un document (admin seulement)
export const updateDocument = async (documentId: string, documentData: any): Promise<any> => {
  try {
    await updateDoc(doc(db, 'documents', documentId), {
      ...documentData,
      updatedAt: Timestamp.now()
    });
    
    // Retourner le document mis à jour
    const docSnapshot = await getDoc(doc(db, 'documents', documentId));
    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
    }
    throw new Error('Document non trouvé après mise à jour');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    throw error;
  }
};

// Supprimer un document (admin seulement)
export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'documents', documentId));
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    throw error;
  }
};

// Incrémenter le compteur de téléchargement
export const incrementDownloadCount = async (documentId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    await updateDoc(docRef, {
      downloadCount: increment(1)
    });
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
    throw error;
  }
};

// Récupérer un document par ID (accès public)
export const getDocumentById = async (documentId: string): Promise<any> => {
  try {
    const docSnapshot = await getDoc(doc(db, 'documents', documentId));
    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    throw error;
  }
};

export { auth, db, storage, googleProvider };
