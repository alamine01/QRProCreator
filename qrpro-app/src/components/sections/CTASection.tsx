'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, CheckCircle, Star, QrCode } from 'lucide-react';

export function CTASection() {
  const { user } = useAuth();

  const benefits = [
    "Création de profil en 2 minutes",
    "QR code généré automatiquement",
    "Partage sur tous les réseaux sociaux",
    "Export vCard pour contacts",
    "Interface mobile optimisée",
    "Suivre le nombre de scans",
    "Modifier mon profil quand je veux et mettre ce que je veux",
    "Support client 24/7"
  ];

  return (
    <section className="pt-8 pb-20 lg:pt-12 lg:pb-32 relative">
      {/* Effet néon en arrière-plan */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-br from-orange-300/30 to-red-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-300/25 to-pink-300/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
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
              <QrCode className="h-5 w-5" />
              <span>Créer Mon Profil Gratuit</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
          
          <a
            href="https://wa.me/221787526236?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20QR%20Pro%20Creator%20et%20cr%C3%A9er%20mon%20profil%20gratuit."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <span>Nous Contacter</span>
          </a>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-700 mb-4">
              "QR Pro Creator a révolutionné ma façon de partager mes informations. Plus besoin de cartes papier !"
            </p>
            <div className="text-sm text-gray-600">
              <strong>Marie Dubois</strong><br />
              Directrice Marketing
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl">
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

          <div className="glass-effect p-6 rounded-2xl">
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
    </section>
  );
}
