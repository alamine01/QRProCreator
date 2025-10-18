'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export function AuthRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Attendre que l'authentification soit chargée

    // Si l'utilisateur est connecté et doit changer son mot de passe
    if (user && user.mustChangePassword && pathname !== '/auth/force-change-password') {
      router.push('/auth/force-change-password');
      return;
    }

    // Si l'utilisateur est connecté mais n'a pas fourni son téléphone
    if (user && !user.phoneCollected && pathname !== '/auth/collect-phone') {
      console.log('🔧 DEBUG: Utilisateur sans téléphone détecté, redirection vers collect-phone');
      router.push('/auth/collect-phone');
      return;
    }

    // Pages protégées qui nécessitent une connexion
    const protectedPages = ['/dashboard', '/pro'];
    
    // Si l'utilisateur est connecté et qu'il est sur la page d'accueil, rediriger vers dashboard
    if (user && !user.mustChangePassword && user.phoneCollected && pathname === '/') {
      console.log('🔧 DEBUG: Utilisateur complet détecté, redirection vers dashboard');
      router.push('/dashboard');
    }
    
    // Si l'utilisateur n'est pas connecté et qu'il est sur une page protégée, rediriger vers l'accueil
    if (!user && protectedPages.some(page => pathname.startsWith(page))) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  return null; // Ce composant ne rend rien
}
