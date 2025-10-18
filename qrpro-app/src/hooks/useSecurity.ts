'use client';

import { useEffect, useState } from 'react';

interface SecurityCheck {
  isSecure: boolean;
  isLoading: boolean;
  error?: string;
  securityLevel: 'low' | 'medium' | 'high';
  warnings: string[];
}

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  updatedAt?: Date | any;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useSecuritySimple = (
  authState: AuthState,
  requiredLevel: 'user' | 'admin' | 'super-admin' = 'user'
): SecurityCheck => {
  const [securityCheck, setSecurityCheck] = useState<SecurityCheck>({
    isSecure: false,
    isLoading: true,
    securityLevel: 'low',
    warnings: []
  });

  useEffect(() => {
    // Vérification de base
    if (authState.loading) {
      setSecurityCheck(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // Vérification de l'utilisateur
    if (!authState.user) {
      setSecurityCheck({
        isSecure: false,
        isLoading: false,
        error: 'Non connecté',
        securityLevel: 'low',
        warnings: ['Utilisateur non authentifié']
      });
      return;
    }

    const warnings: string[] = [];
    const { user, isAdmin } = authState;

    // Vérification des permissions selon le niveau requis
    let isSecure = false;
    let securityLevel: 'low' | 'medium' | 'high' = 'low';

    switch (requiredLevel) {
      case 'user':
        isSecure = true;
        securityLevel = 'medium';
        break;
        
      case 'admin':
        if (isAdmin) {
          isSecure = true;
          securityLevel = 'high';
        } else {
          warnings.push('Droits administrateur requis');
        }
        break;
        
      case 'super-admin':
        if (isAdmin && user.email === 'bahmouhamedalamine@gmail.com') {
          isSecure = true;
          securityLevel = 'high';
        } else {
          warnings.push('Droits super-administrateur requis');
        }
        break;
    }

    // Vérifications de sécurité supplémentaires
    if (isSecure) {
      // Vérifier la validité de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        warnings.push('Format d\'email invalide');
        isSecure = false;
      }

      // Vérifier la fraîcheur de la session (optionnel)
      const lastActivity = user.updatedAt;
      if (lastActivity) {
        const now = new Date();
        const lastActivityDate = lastActivity instanceof Date ? lastActivity : new Date(lastActivity);
        const hoursSinceActivity = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceActivity > 24) {
          warnings.push('Session ancienne - reconnexion recommandée');
        }
      }

      // Vérifier la présence de données sensibles
      if (user.isAdmin && !user.profilePicture) {
        warnings.push('Profil admin sans photo - sécurité renforcée recommandée');
      }
    }

    setSecurityCheck({
      isSecure,
      isLoading: false,
      securityLevel,
      warnings
    });

  }, [authState.loading, authState.user, authState.isAdmin, requiredLevel]);

  return securityCheck;
};

