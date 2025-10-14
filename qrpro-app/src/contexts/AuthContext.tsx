'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { auth, getUserProfile, createUserProfile, saveUserProfile, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
  updateUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

        if (firebaseUser) {
          try {
            // Essayer de récupérer le profil existant depuis Firestore
            let userData = await getUserProfile(firebaseUser.uid);
          
          if (!userData) {
            // Si aucun profil n'existe, créer un nouveau profil
            const displayName = firebaseUser.displayName || '';
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            console.log('Création d\'un nouveau profil utilisateur:', {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              firstName,
              lastName
            });

            // Générer un slug unique pour le profil
            const baseSlug = firebaseUser.email?.split('@')[0] || 'user';
            let profileSlug = baseSlug;
            let counter = 1;
            
            // Vérifier l'unicité du slug
            while (true) {
              const slugQuery = query(
                collection(db, 'users'),
                where('profileSlug', '==', profileSlug)
              );
              const slugSnapshot = await getDocs(slugQuery);
              
              if (slugSnapshot.empty) break;
              
              profileSlug = `${baseSlug}-${counter}`;
              counter++;
            }

            userData = {
              id: firebaseUser.uid,
              googleId: firebaseUser.providerData[0]?.providerId === 'google.com' ? firebaseUser.uid : '',
              email: firebaseUser.email || '',
              firstName: firstName,
              lastName: lastName,
              profilePicture: firebaseUser.photoURL || '',
              profileSlug: profileSlug,
              profession: '',
              phone: '',
              phoneSecondary: '',
              phoneThird: '',
              phoneFourth: '',
              address: '',
              location: '',
              reviewLink: '',
              biography: '',
              linkedin: '',
              instagram: '',
              twitter: '',
              facebook: '',
              whatsapp: '',
              youtube: '',
              tiktok: '',
              snapchat: '',
              isAdmin: false,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            };

            // Créer le profil dans Firestore
            await createUserProfile(firebaseUser.uid, userData);
            console.log('Nouveau profil utilisateur créé dans Firestore');
          } else {
            console.log('Profil utilisateur récupéré depuis Firestore');
          }


          setUser(userData);
          // ADMIN SPÉCIFIQUE: bahmouhamedalamine@gmail.com
          const isSpecificAdmin = userData.email === 'bahmouhamedalamine@gmail.com';
          setIsAdmin(isSpecificAdmin || userData.isAdmin || false);
          if (isSpecificAdmin) {
            console.log('🔧 DEBUG: Admin spécifique détecté - bahmouhamedalamine@gmail.com');
          }
        } catch (error) {
          console.error('Erreur lors de la gestion du profil utilisateur:', error);
          // En cas d'erreur, utiliser les données Google de base
          const displayName = firebaseUser.displayName || '';
          const nameParts = displayName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const fallbackUserData: User = {
            id: firebaseUser.uid,
            googleId: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: firstName,
            lastName: lastName,
            profilePicture: firebaseUser.photoURL || '',
            profileSlug: firebaseUser.email?.split('@')[0] || '',
            profession: '',
            phone: '',
            phoneSecondary: '',
            phoneThird: '',
            phoneFourth: '',
            address: '',
            location: '',
            reviewLink: '',
            biography: '',
            linkedin: '',
            instagram: '',
            twitter: '',
            facebook: '',
            whatsapp: '',
            youtube: '',
            tiktok: '',
            snapchat: '',
            isAdmin: false,
            createdAt: new Date() as any,
            updatedAt: new Date() as any,
          };
          setUser(fallbackUserData);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      // Forcer la redirection vers la page d'accueil après déconnexion
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!firebaseUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      // Sauvegarder dans Firestore
      await saveUserProfile(firebaseUser.uid, userData);
      
      // Mettre à jour l'état local
      setUser(prev => prev ? { ...prev, ...userData } : null);
      
      console.log('Profil utilisateur mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isAdmin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
