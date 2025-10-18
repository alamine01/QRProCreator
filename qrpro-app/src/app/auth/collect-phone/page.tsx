'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizePhone, getPhoneValidationError } from '@/lib/phoneValidation';
import {
  Phone,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function CollectPhonePage() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }
    // Si l'utilisateur a déjà fourni son téléphone, rediriger vers le dashboard
    if (!loading && user && user.phoneCollected) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !firebaseUser) {
      setError('Utilisateur non connecté');
      return;
    }

    // Validation du numéro de téléphone
    const phoneError = getPhoneValidationError(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    try {
      setIsLoading(true);

      // Normaliser le numéro de téléphone
      const normalizedPhone = normalizePhone(phone);

      // Mettre à jour le profil utilisateur dans Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        phone: normalizedPhone,
        phoneCollected: true,
        updatedAt: new Date(),
      });

      console.log('Numéro de téléphone collecté avec succès');
      console.log('Données mises à jour:', { phone: normalizedPhone, phoneCollected: true });
      
      // Forcer une mise à jour du contexte d'authentification
      // En rechargeant la page pour que le contexte soit mis à jour
      if (typeof window !== 'undefined') {
        console.log('Redirection vers dashboard dans 100ms...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
    } catch (error: any) {
      console.error('Erreur lors de la collecte du numéro:', error);
      setError('Erreur lors de la sauvegarde du numéro de téléphone');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || user.phoneCollected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Complétez votre profil
            </h1>
            <p className="text-gray-600 mb-4">
              Nous avons besoin de votre numéro de téléphone pour finaliser votre inscription.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Numéro de téléphone requis
                </p>
              </div>

              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sauvegarde...' : (
                  <>
                    <span>Continuer</span>
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
