'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Smartphone, 
  Share2, 
  BarChart3, 
  Palette, 
  Shield
} from 'lucide-react';

// Composant compteur animé
function Counter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(progress * end);
      setCount(currentCount);
      
      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <div className="text-4xl font-bold gradient-text mb-2">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Ultra Rapide",
      description: "Créez votre QR code en moins de 30 secondes. Pas de configuration complexe, pas d'attente.",
      color: "bg-orange-500",
    },
    {
      icon: Smartphone,
      title: "Optimisé Mobile",
      description: "Expérience de visualisation parfaite sur tous les appareils. Votre profil est magnifique sur téléphones, tablettes et ordinateurs.",
      color: "bg-purple-500",
    },
    {
      icon: Share2,
      title: "Partage Facile",
      description: "Partagez votre QR code partout - cartes de visite, présentations, réseaux sociaux ou supports imprimés.",
      color: "bg-blue-500",
    },
    {
      icon: BarChart3,
      title: "Analyses",
      description: "Suivez combien de personnes scannent votre QR code et quand. Obtenez des insights sur les performances de votre profil.",
      color: "bg-green-500",
    },
    {
      icon: Palette,
      title: "Personnalisable",
      description: "Personnalisez votre profil avec vos propres couleurs, photos et branding. Rendez-le unique.",
      color: "bg-pink-500",
    },
    {
      icon: Shield,
      title: "Sécurisé & Privé",
      description: "Vos données sont protégées avec une sécurité de niveau industriel. Vous contrôlez les informations partagées.",
      color: "bg-purple-700",
    }
  ];


  return (
    <section id="features" className="py-20 lg:py-32 relative">
      {/* Effet néon en arrière-plan */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-blue-300/30 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-green-300/25 to-cyan-300/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               {/* Section Header */}
               <div className="text-center mb-16">
                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                   Pourquoi Choisir{' '}
                   <span className="gradient-text">QR Pro Creator</span> ?
                 </h2>
                 <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                   Découvrez la nouvelle génération de partage de contacts avec nos fonctionnalités innovantes
                 </p>
               </div>

               {/* Features Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                 {features.map((feature, index) => (
                   <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                     <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg`}>
                       <feature.icon className="h-8 w-8 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                     </div>
                     <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">{feature.title}</h3>
                     <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
                   </div>
                 ))}
               </div>

        {/* Stats Section avec compteurs animés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Counter end={1000} duration={2500} suffix="+" />
            <div className="text-gray-600">Profils créés</div>
          </div>
          <div className="text-center">
            <Counter end={50000} duration={3000} suffix="+" />
            <div className="text-gray-600">QR codes scannés</div>
          </div>
          <div className="text-center">
            <Counter end={99.9} duration={2000} suffix="%" />
            <div className="text-gray-600">Disponibilité</div>
          </div>
        </div>
      </div>
    </section>
  );
}
