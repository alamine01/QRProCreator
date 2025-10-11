'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { User, LogOut, QrCode, Settings, Users } from 'lucide-react';

export function Navigation() {
  const { user, firebaseUser, loading, isAdmin } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <QrCode className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold gradient-text">QRPro</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              Accueil
            </Link>
            {user && (
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                Tableau de bord
              </Link>
            )}
            {isAdmin && (
              <Link 
                href="/admin" 
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                Administration
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                </div>

                {/* Settings Dropdown */}
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Mon Profil
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Se connecter</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
