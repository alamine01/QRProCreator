'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminGuard = ({ children, fallback }: AdminGuardProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [serverValidation, setServerValidation] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log('🔍 [ADMIN GUARD] Début de la vérification:', {
          loading,
          user: user ? {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin
          } : null
        });

        // Attendre que l'authentification se charge
        if (loading) {
          console.log('⏳ [ADMIN GUARD] Chargement en cours...');
          return;
        }

        // Vérifier si l'utilisateur est connecté
        if (!user) {
          console.log('🚫 [ADMIN GUARD] Utilisateur non connecté');
          router.push('/auth/signin');
          return;
        }

        // Vérifier les permissions admin côté client
        if (!user.isAdmin) {
          console.log('🚫 [ADMIN GUARD] Pas de droits admin côté client:', {
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin
          });
          router.push('/dashboard');
          return;
        }

        // VÉRIFICATION DE SÉCURITÉ : Validation côté serveur simplifiée
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

          if (response.ok) {
            const data = await response.json();
            if (data.isValid && data.isAdmin) {
              console.log('✅ [ADMIN GUARD] Validation serveur réussie');
              setServerValidation(true);
            } else {
              console.log('🚫 [ADMIN GUARD] Validation serveur échouée');
              setServerValidation(false);
            }
          } else {
            console.log('⚠️ [ADMIN GUARD] Erreur de validation serveur, utilisation du fallback client');
            setServerValidation(true); // Fallback vers validation client
          }
        } catch (error) {
          console.error('⚠️ [ADMIN GUARD] Erreur de validation serveur:', error);
          setServerValidation(true); // Fallback vers validation client
        }

        console.log('✅ [ADMIN GUARD] Accès admin autorisé:', {
          userId: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          serverValidation
        });

      } catch (error) {
        console.error('❌ [ADMIN GUARD] Erreur de sécurité:', error);
        router.push('/auth/signin');
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [user, loading, router]);

  // Affichage de chargement
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Vérifier l'accès admin
  if (!user || !user.isAdmin || serverValidation === false) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            {serverValidation === false && (
              <p className="text-sm mt-2">⚠️ Validation serveur échouée</p>
            )}
          </div>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="block w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Retour au tableau de bord
            </button>
            <button
              onClick={() => router.push('/admin-management')}
              className="block w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Gestion des administrateurs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Accès autorisé
  return <>{children}</>;
};
