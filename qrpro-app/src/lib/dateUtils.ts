import { Timestamp } from 'firebase/firestore';

/**
 * Convertit une date Firebase Timestamp ou autre format en string formatée
 */
export const formatFirebaseDate = (date: any, options?: Intl.DateTimeFormatOptions): string => {
  if (!date) return 'Non disponible';
  
  try {
    let dateObj: Date;
    
    // Si c'est un Timestamp Firebase
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    }
    // Si c'est déjà un objet Date
    else if (date instanceof Date) {
      dateObj = date;
    }
    // Si c'est un string ou autre
    else {
      dateObj = new Date(date);
    }
    
    if (dateObj && !isNaN(dateObj.getTime())) {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return dateObj.toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
    }
    
    return 'Date invalide';
  } catch (error) {
    console.error('Erreur lors de la conversion de la date:', error);
    return 'Erreur de conversion';
  }
};

/**
 * Convertit une date Firebase Timestamp ou autre format en string pour les inputs date
 */
export const formatFirebaseDateForInput = (date: any): string => {
  if (!date) return '';
  
  try {
    let dateObj: Date;
    
    // Si c'est un Timestamp Firebase
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    }
    // Si c'est déjà un objet Date
    else if (date instanceof Date) {
      dateObj = date;
    }
    // Si c'est un string ou autre
    else {
      dateObj = new Date(date);
    }
    
    if (dateObj && !isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0];
    }
    
    return '';
  } catch (error) {
    console.error('Erreur lors de la conversion de la date pour input:', error);
    return '';
  }
};
