'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithGoogle } from '@/lib/firebase';
import { User, LogOut, QrCode, Settings, Users } from 'lucide-react';

export function Navigation() {
  const { user, firebaseUser, loading, isAdmin, logout } = useAuth();

  // Redirection vers la page de connexion au lieu d'appeler directement Google

  return (
    <nav className="glass-effect sticky top-0 z-50 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold gradient-text">QR Pro Creator</span>
          </Link>


          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* Admin Link */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Tableau de Bord</span>
                </Link>
                
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={logout}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg border-2 border-white/20"
                >
                  <User className="h-4 w-4" />
                  <span>Se connecter</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
