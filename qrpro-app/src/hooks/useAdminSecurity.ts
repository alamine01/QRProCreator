'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityCheck {
  isAuthorized: boolean;
  isLoading: boolean;
  error?: string;
  securityLevel: 'low' | 'medium' | 'high';
}

export const useAdminSecurity = (requiredLevel: 'admin' | 'super-admin' = 'admin'): SecurityCheck => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [securityCheck, setSecurityCheck] = useState<SecurityCheck>({
    isAuthorized: false,
    isLoading: true,
    securityLevel: 'low'
  });

  useEffect(() => {
    const performSecurityCheck = async () => {
      try {
        // Vérification de base
        if (loading) {
          setSecurityCheck(prev => ({ ...prev, isLoading: true }));
          return;
        }

        // Vérification de l'utilisateur
        if (!user) {
          console.log('🚫 [SECURITY] Accès refusé - Utilisateur non connecté');
          setSecurityCheck({
            isAuthorized: false,
            isLoading: false,
            error: 'Non connecté',
            securityLevel: 'low'
          });
          router.push('/auth/signin');
          return;
        }

        // Vérification des permissions admin
        if (!user.isAdmin) {
          console.log('🚫 [SECURITY] Accès refusé - Pas de droits admin:', {
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin
          });
          setSecurityCheck({
            isAuthorized: false,
            isLoading: false,
            error: 'Accès refusé - Droits insuffisants',
            securityLevel: 'medium'
          });
          router.push('/dashboard');
          return;
        }

        // Vérification de la session côté serveur
        try {
          const response = await fetch('/api/auth/verify-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              email: user.email
            })
          });

          if (!response.ok) {
            throw new Error('Session invalide');
          }

          const data = await response.json();
          
          if (!data.isValid || !data.isAdmin) {
            throw new Error('Permissions révoquées');
          }

          // Vérification du niveau de sécurité
          const securityLevel = data.isSuperAdmin ? 'high' : 'medium';
          
          console.log('✅ [SECURITY] Accès admin autorisé:', {
            userId: user.id,
            email: user.email,
            securityLevel,
            timestamp: new Date().toISOString()
          });

          setSecurityCheck({
            isAuthorized: true,
            isLoading: false,
            securityLevel
          });

        } catch (error) {
          console.error('❌ [SECURITY] Échec de la vérification serveur:', error);
          setSecurityCheck({
            isAuthorized: false,
            isLoading: false,
            error: 'Session expirée',
            securityLevel: 'high'
          });
          router.push('/auth/signin');
        }

      } catch (error) {
        console.error('❌ [SECURITY] Erreur de sécurité:', error);
        setSecurityCheck({
          isAuthorized: false,
          isLoading: false,
          error: 'Erreur de sécurité',
          securityLevel: 'high'
        });
        router.push('/auth/signin');
      }
    };

    performSecurityCheck();
  }, [user, loading, router, requiredLevel]);

  return securityCheck;
};
