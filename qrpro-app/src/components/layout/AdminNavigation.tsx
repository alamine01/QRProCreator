'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDataPreloader } from '@/lib/dataPreloader';
import { 
  FaHome, 
  FaChartBar, 
  FaUsers, 
  FaShoppingCart, 
  FaCreditCard,
  FaFileUpload,
  FaArrowLeft,
  FaCog,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const adminNavItems = [
  {
    name: 'Tableau de Bord',
    href: '/admin',
    icon: FaHome,
    description: 'Vue d\'ensemble et statistiques',
    preloadPage: 'dashboard' as const
  },
  {
    name: 'Statistiques',
    href: '/admin/statistics',
    icon: FaChartBar,
    description: 'Analyses et métriques détaillées',
    preloadPage: 'statistics' as const
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: FaUsers,
    description: 'Gestion des utilisateurs',
    preloadPage: 'users' as const
  },
  {
    name: 'Commandes',
    href: '/admin/orders',
    icon: FaShoppingCart,
    description: 'Suivi des commandes',
    preloadPage: 'orders' as const
  },
  {
    name: 'Cartes de Visite',
    href: '/admin/business-cards',
    icon: FaCreditCard,
    description: 'Gestion des cartes d\'entreprise',
    preloadPage: 'business-cards' as const
  },
  {
    name: 'Documents',
    href: '/admin/documents',
    icon: FaFileUpload,
    description: 'Upload et gestion des documents',
    preloadPage: 'documents' as const
  }
];

export function AdminNavigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { preloadPageData } = useDataPreloader();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fonction pour précharger les données au survol
  const handleMouseEnter = useCallback((preloadPage: string) => {
    preloadPageData(preloadPage as any);
  }, [preloadPageData]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header principal */}
        <div className="flex items-center justify-between py-4">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="font-medium text-sm sm:text-base">Retour</span>
            </Link>
            <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
            <Link href="/admin" className="flex items-center space-x-2">
              <FaCog className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">Admin</span>
            </Link>
          </div>

          {/* User Info - Desktop */}
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Connecté en tant que <span className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Déconnexion
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="sm:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Menu - Desktop */}
        <div className="hidden sm:flex space-x-8 pb-4">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => handleMouseEnter(item.preloadPage)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-4">
            {/* User Info - Mobile */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="text-sm text-gray-600 mb-2">
                Connecté en tant que
              </div>
              <div className="font-medium text-gray-900 mb-2">
                {user?.firstName} {user?.lastName}
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Déconnexion
              </button>
            </div>

            {/* Navigation Links - Mobile */}
            <div className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
