import { Timestamp } from 'firebase/firestore';

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
}

export interface BusinessCard {
  id: string;
  name: string;
  title: string;
  phonePrimary: string;
  phoneSecondary?: string;
  phoneThird?: string;
  phoneFourth?: string;
  email: string;
  address?: string;
  location: string;
  photoPath?: string;
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
  method: 'mobile_money' | 'cash_on_delivery';
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
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
