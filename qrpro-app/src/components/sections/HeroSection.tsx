'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, Smartphone, Share2, Download, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Créez votre{' '}
            <span className="gradient-text">carte de visite</span>
            <br />
            numérique professionnelle
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Partagez facilement vos informations de contact, réseaux sociaux et coordonnées 
            professionnelles avec un simple QR code. Plus besoin de cartes papier !
          </p>

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
              <span>Découvrir les fonctionnalités</span>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass-effect p-6 rounded-2xl text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code Instantané</h3>
              <p className="text-gray-600">Générez votre QR code en quelques secondes</p>
            </div>

            <div className="glass-effect p-6 rounded-2xl text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile First</h3>
              <p className="text-gray-600">Optimisé pour tous les appareils mobiles</p>
            </div>

            <div className="glass-effect p-6 rounded-2xl text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Partage Facile</h3>
              <p className="text-gray-600">Partagez vos informations en un clic</p>
            </div>
          </div>

          {/* Demo QR Code */}
          <div className="mt-16">
            <div className="glass-effect p-8 rounded-3xl max-w-md mx-auto">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exemple de QR Code</h3>
                <div className="bg-white p-4 rounded-xl shadow-lg inline-block mb-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Scannez ce QR code pour voir un exemple de profil
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
