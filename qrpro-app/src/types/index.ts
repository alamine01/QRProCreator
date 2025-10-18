// Type pour éviter l'import direct de Firebase
export type Timestamp = any;

export interface User {
  id: string;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  profession?: string;
  phone?: string;
  phoneSecondary?: string;
  phoneThird?: string;
  phoneFourth?: string;
  biography?: string;
  address?: string;
  location?: string;
  reviewLink?: string;
  // Social media fields
  linkedin?: string;
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
  snapchat?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  profileSlug: string;
  isAdmin: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Champs pour les comptes créés manuellement
  passwordHash?: string; // Mot de passe hashé
  tempPassword?: string; // Mot de passe temporaire en clair pour affichage admin
  mustChangePassword?: boolean; // Force le changement de mot de passe à la première connexion
  accountType?: 'google' | 'manual'; // Type de compte (Google ou manuel)
  phoneCollected?: boolean; // Indique si le numéro de téléphone a été collecté
}

export interface BusinessCard {
  id: string;
  name: string;
  title: string;
  company?: string;
  bio?: string;
  website?: string;
  phonePrimary: string;
  phoneSecondary?: string;
  phoneThird?: string;
  phoneFourth?: string;
  email: string;
  address?: string;
  location: string;
  mapsLink?: string;
  photoPath?: string;
  qrCodePath?: string;
  isActive: boolean;
  // Social media fields
  instagram?: string;
  whatsapp?: string;
  twitter?: string;
  snapchat?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  uniqueId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Types pour le système de commandes de produits physiques
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  category: 'nfc' | 'stickers' | 'pack';
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface PaymentInfo {
  method: 'wave_direct' | 'orange_money' | 'cash_on_delivery';
  provider?: 'orange_money' | 'wave';
  phoneNumber?: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  paymentInfo: PaymentInfo;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancellationReason?: string;
  // Tracking des emails pour éviter les doublons
  lastStatusNotified?: string; // Dernier statut pour lequel un email a été envoyé
  lastStatusEmailSentAt?: Timestamp; // Timestamp du dernier email de statut envoyé
  emailNotificationsEnabled?: boolean; // Flag pour activer/désactiver les notifications
}

export interface Document {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  publicUrl: string;
  qrCodePath?: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  isActive: boolean;
  downloadCount: number;
  qrScanCount: number;
  description?: string;
  mimeType: string;
  classification: 'public' | 'confidential';
  ownerEmail: string;
  statsTrackingEnabled: boolean;
  ownerPassword?: string; // Mot de passe hashé pour l'accès aux statistiques
  ownerPasswordPlain?: string; // Mot de passe en clair pour affichage admin
}

export interface QrScan {
  id: string;
  documentId: string;
  timestamp: Timestamp;
  userAgent?: string;
  ip?: string;
  location?: string;
}

export interface Sticker {
  id: string;
  qrCode: string; // QR code unique fixe
  barcode: string; // Code-barres virtuel pour identification
  status: 'available' | 'assigned'; // Disponible ou assigné
  assignedUserId?: string; // ID de l'utilisateur si assigné
  assignedAt?: Timestamp; // Date d'assignation
  createdAt: Timestamp;
  // Profil aléatoire généré
  randomProfile: {
    firstName: string;
    lastName: string;
    profession: string;
    company: string;
    phone: string;
    email: string;
    bio: string;
    avatar?: string;
  };
}

// Interfaces pour l'authentification
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
