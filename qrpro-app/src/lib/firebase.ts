import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, orderBy, limit, Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { User, Order, Product, OrderItem, CustomerInfo, PaymentInfo } from '@/types';

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
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Erreur de connexion Google:', error);
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
      return doc.data() as User;
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
      return userSnap.data() as User;
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
    // Détecter si c'est un téléchargement unique (même logique que pour les scans)
    const storageKey = `vcard_download_${userId}`;
    const lastDownload = localStorage.getItem(storageKey);
    const now = Date.now();
    const isUnique = !lastDownload || (now - parseInt(lastDownload)) > 5 * 60 * 1000; // 5 minutes
    
    if (isUnique) {
      localStorage.setItem(storageKey, now.toString());
    }

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

// Fonction pour récupérer les statistiques d'un utilisateur
export const getUserStats = async (userId: string, period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<StatsData> => {
  try {
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
    const response = await fetch('https://ipapi.co/json/', {
      timeout: 3000
    });
    
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
    
    // Envoyer une notification email de confirmation
    await sendOrderConfirmationEmail(orderData.customerInfo.email, orderNumber, totalAmount);
    
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    throw error;
  }
};

// Récupérer les commandes d'un utilisateur
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      } as Order);
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
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  notes?: string,
  cancellationReason?: string
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason;
    }
    
    await updateDoc(doc(db, 'orders', orderId), updateData);
    
    // Envoyer une notification email de changement de statut
    const order = await getOrderById(orderId);
    if (order) {
      await sendOrderStatusUpdateEmail(order.customerInfo.email, order.orderNumber, status);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
};

// Annuler une commande (seulement si en attente)
export const cancelOrder = async (orderId: string, reason: string): Promise<void> => {
  try {
    const order = await getOrderById(orderId);
    
    if (!order) {
      throw new Error('Commande non trouvée');
    }
    
    if (order.status !== 'pending') {
      throw new Error('Seules les commandes en attente peuvent être annulées');
    }
    
    await updateOrderStatus(orderId, 'cancelled', undefined, reason);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    throw error;
  }
};

// Fonction pour envoyer un email de confirmation de commande
const sendOrderConfirmationEmail = async (email: string, orderNumber: string, totalAmount: number): Promise<void> => {
  try {
    // Ici vous pouvez intégrer votre service d'email (SendGrid, Mailgun, etc.)
    // Pour l'instant, on log juste l'information
    console.log(`Email de confirmation envoyé à ${email} pour la commande ${orderNumber} (${totalAmount} FCFA)`);
    
    // TODO: Implémenter l'envoi d'email réel
    // await emailService.send({
    //   to: email,
    //   subject: `Confirmation de commande ${orderNumber}`,
    //   template: 'order-confirmation',
    //   data: { orderNumber, totalAmount }
    // });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
  }
};

// Fonction pour envoyer un email de mise à jour de statut
const sendOrderStatusUpdateEmail = async (email: string, orderNumber: string, status: Order['status']): Promise<void> => {
  try {
    const statusMessages = {
      pending: 'Votre commande est en attente de traitement',
      processing: 'Votre commande est en cours de traitement',
      delivered: 'Votre commande a été livrée',
      cancelled: 'Votre commande a été annulée'
    };
    
    console.log(`Email de mise à jour envoyé à ${email} pour la commande ${orderNumber}: ${statusMessages[status]}`);
    
    // TODO: Implémenter l'envoi d'email réel
    // await emailService.send({
    //   to: email,
    //   subject: `Mise à jour de votre commande ${orderNumber}`,
    //   template: 'order-status-update',
    //   data: { orderNumber, status, message: statusMessages[status] }
    // });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de mise à jour:', error);
  }
};

export { auth, db, storage, googleProvider };
