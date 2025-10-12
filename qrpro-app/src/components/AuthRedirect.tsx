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

    // Pages protégées qui nécessitent une connexion
    const protectedPages = ['/dashboard', '/pro'];
    
    // Si l'utilisateur est connecté et qu'il est sur la page d'accueil, rediriger vers dashboard
    if (user && pathname === '/') {
      router.push('/dashboard');
    }
    
    // Si l'utilisateur n'est pas connecté et qu'il est sur une page protégée, rediriger vers l'accueil
    if (!user && protectedPages.some(page => pathname.startsWith(page))) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  return null; // Ce composant ne rend rien
}
