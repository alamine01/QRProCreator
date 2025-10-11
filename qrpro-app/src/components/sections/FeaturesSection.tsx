import React from 'react';
import { 
  QrCode, 
  Smartphone, 
  Share2, 
  Download, 
  Users, 
  Shield, 
  Zap, 
  Globe,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: QrCode,
      title: "QR Code Dynamique",
      description: "Générez des QR codes uniques pour chaque profil avec mise à jour en temps réel",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Smartphone,
      title: "Design Responsive",
      description: "Interface optimisée pour tous les appareils, du mobile au desktop",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Share2,
      title: "Partage Instantané",
      description: "Partagez vos informations de contact via QR code, lien direct ou réseaux sociaux",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Download,
      title: "Export vCard",
      description: "Téléchargez vos informations au format vCard pour les contacts",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Users,
      title: "Profils Publics",
      description: "Créez des profils publics partageables avec vos clients et partenaires",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: Shield,
      title: "Sécurisé",
      description: "Authentification Google OAuth et données protégées par Firebase",
      color: "bg-red-100 text-red-600"
    }
  ];

  const socialPlatforms = [
    { icon: Linkedin, name: "LinkedIn", color: "text-blue-600" },
    { icon: Instagram, name: "Instagram", color: "text-pink-600" },
    { icon: Twitter, name: "Twitter", color: "text-blue-400" },
    { icon: Facebook, name: "Facebook", color: "text-blue-700" },
  ];

  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Fonctionnalités{' '}
            <span className="gradient-text">complètes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tout ce dont vous avez besoin pour créer et gérer votre présence numérique professionnelle
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="glass-effect p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Contact Information Demo */}
        <div className="glass-effect p-8 rounded-3xl mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Informations de Contact Complètes
            </h3>
            <p className="text-gray-600">
              Ajoutez tous vos moyens de contact et réseaux sociaux
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations de Base</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                  <Phone className="h-5 w-5 text-primary-500" />
                  <span className="text-gray-700">+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span className="text-gray-700">contact@exemple.com</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <span className="text-gray-700">Paris, France</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Réseaux Sociaux</h4>
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                    <platform.icon className={`h-5 w-5 ${platform.color}`} />
                    <span className="text-gray-700">{platform.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">1000+</div>
            <div className="text-gray-600">Profils créés</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">50K+</div>
            <div className="text-gray-600">QR codes scannés</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
            <div className="text-gray-600">Disponibilité</div>
          </div>
        </div>
      </div>
    </section>
  );
}
