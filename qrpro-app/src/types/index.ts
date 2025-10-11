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

export interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  businessType: 'business' | 'individual';
  products: string[];
  purpose: string;
  purposeDetails?: string;
  emergencyContact1: string;
  emergencyContact2?: string;
  socialMedia1?: string;
  socialMedia2?: string;
  socialMedia3?: string;
  socialMedia4?: string;
  source: string;
  sourceDetails?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
