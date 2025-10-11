'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';

export function CTASection() {
  const { user } = useAuth();

  const benefits = [
    "Création de profil en 2 minutes",
    "QR code généré automatiquement",
    "Partage sur tous les réseaux sociaux",
    "Export vCard pour contacts",
    "Interface mobile optimisée",
    "Support client 24/7"
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-effect rounded-3xl p-8 lg:p-16 text-center">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Prêt à créer votre{' '}
              <span className="gradient-text">carte de visite numérique</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Rejoignez des milliers de professionnels qui ont déjà modernisé leur façon de partager leurs informations de contact.
            </p>
          </div>

          {/* Benefits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Accéder au tableau de bord</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
            
            <Link
              href="#features"
              className="glass-effect text-gray-700 hover:text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>Voir les fonctionnalités</span>
            </Link>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "QRPro a révolutionné ma façon de partager mes informations. Plus besoin de cartes papier !"
              </p>
              <div className="text-sm text-gray-600">
                <strong>Marie Dubois</strong><br />
                Directrice Marketing
              </div>
            </div>

            <div className="bg-white/50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Interface intuitive et fonctionnalités complètes. Parfait pour les professionnels modernes."
              </p>
              <div className="text-sm text-gray-600">
                <strong>Jean Martin</strong><br />
                Consultant IT
              </div>
            </div>

            <div className="bg-white/50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Excellent outil pour les événements professionnels. Mes clients adorent scanner mon QR code."
              </p>
              <div className="text-sm text-gray-600">
                <strong>Sophie Laurent</strong><br />
                Entrepreneure
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white">
            <h3 className="text-2xl font-bold mb-4">
              Commencez dès aujourd'hui
            </h3>
            <p className="text-primary-100 mb-6">
              Créez votre profil professionnel en moins de 2 minutes
            </p>
            {!user && (
              <Link
                href="/auth/signin"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold transition-all duration-200 inline-flex items-center space-x-2"
              >
                <span>Créer mon profil</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
