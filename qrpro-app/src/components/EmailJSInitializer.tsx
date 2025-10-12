'use client';

import { useEffect } from 'react';
import { initializeEmailJS } from '@/lib/emailjs';

export function EmailJSInitializer() {
  useEffect(() => {
    // Initialiser EmailJS au démarrage de l'application
    initializeEmailJS();
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
