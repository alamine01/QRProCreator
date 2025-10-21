'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, ArrowRight, Play, Check } from 'lucide-react';
import { DashboardMiniature } from '@/components/DashboardMiniature';

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen flex items-center">
      {/* Effet néon - Formes colorées en arrière-plan */}
      <div className="absolute inset-0">
        {/* Forme orange/peach à gauche */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-300/40 to-orange-400/30 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-200/50 to-orange-300/40 rounded-full blur-2xl"></div>
        
        {/* Forme violette à droite */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-purple-400/40 to-indigo-400/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-gradient-to-br from-purple-300/50 to-indigo-300/40 rounded-full blur-2xl"></div>
        
        {/* Formes supplémentaires pour plus d'effet */}
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-gradient-to-br from-blue-300/30 to-cyan-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-1/3 w-56 h-56 bg-gradient-to-br from-pink-300/30 to-rose-300/20 rounded-full blur-2xl"></div>
        
        {/* Particules flottantes */}
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Contenu texte à gauche */}
          <div className="text-left">
            {/* Welcome Text avec forme pill */}
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-3 sm:px-4 py-2 rounded-full border border-orange-200/50 shadow-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 sm:mr-3"></div>
                  <span className="text-primary-700 font-medium text-xs sm:text-sm">Bienvenue dans l'avenir du partage de contacts</span>
                </div>
              </div>
            </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Créez votre{' '}
              <span className="gradient-text">QR code personnel</span>
            <br />
              en quelques clics
          </h1>

          {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              Transformez vos informations de contact en un magnifique QR code scannable. 
              Partagez votre profil professionnel, réseaux sociaux et coordonnées en un seul scan.
          </p>

          {/* CTA Buttons */}
                   <div className="mb-8">
                     <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {user ? (
              <Link
                href="/dashboard"
                           className="bg-primary-500 hover:bg-primary-600 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                           <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Accéder au tableau de bord</span>
                <span className="sm:hidden">Tableau de bord</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            ) : (
                         <Link
                           href="/auth/signin"
                           className="bg-primary-500 hover:bg-primary-600 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
                         >
                           <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                           <span className="hidden sm:inline">Créer Mon Profil Gratuit</span>
                           <span className="sm:hidden">Créer Mon Profil</span>
                           <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                         </Link>
            )}
            
            <Link
              href="#features"
                         className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
            >
                         <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                         <span>En Savoir Plus</span>
            </Link>
                     </div>
                   </div>

                   {/* Éléments verts avec coches */}
                   <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-sm">
                     <div className="flex items-center space-x-2">
                       <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                       <span className="text-gray-700 font-medium">100% Gratuit</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                       <span className="text-gray-700 font-medium">QR Instantané</span>
                     </div>
                   </div>
          </div>

          {/* Dashboard Miniature à droite */}
          <div className="relative flex justify-center lg:justify-end">
            <DashboardMiniature />
          </div>
        </div>
      </div>
    </section>
  );
}
