import React from 'react';
import { QrCode } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <QrCode className="h-8 w-8 mr-2 text-primary-500" />
            <span className="text-xl font-bold gradient-text">QR Pro Creator</span>
          </div>
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Tous droits réservés pour QR Pro Creator.</p>
          <p className="text-gray-500 text-xs mt-2">Créé avec ❤️ pour simplifier le partage de contacts</p>
        </div>
      </div>
    </footer>
  );
}
