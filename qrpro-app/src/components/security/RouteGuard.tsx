'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSecuritySimple } from '@/hooks/useSecurity';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield, AlertTriangle, Lock } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredLevel: 'user' | 'admin' | 'super-admin';
  fallback?: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiredLevel, 
  fallback 
}) => {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const { isSecure, isLoading, error, securityLevel, warnings } = useSecuritySimple(
    { user, loading, isAdmin }, 
    requiredLevel
  );

  // Affichage de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Vérification de sécurité en cours...</p>
        </div>
      </div>
    );
  }

  // Accès refusé
  if (!isSecure) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-orange-100">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accès Non Autorisé
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error || 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Retour au Dashboard
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Page d'Accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Avertissements de sécurité
  if (warnings.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
        {/* Bannière d'avertissement */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Avertissements de Sécurité
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="p-4">
          {children}
        </div>
      </div>
    );
  }

  // Accès autorisé - Sans indicateur visible
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Contenu principal */}
      {children}
    </div>
  );
};
