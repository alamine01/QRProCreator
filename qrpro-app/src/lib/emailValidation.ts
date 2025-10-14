// Validation des adresses email
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  // Vérifier le format de base
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }
  
  // Vérifier les erreurs communes
  if (email.includes('..')) {
    return { isValid: false, error: 'Email contient des points consécutifs' };
  }
  
  if (email.endsWith('.')) {
    return { isValid: false, error: 'Email ne peut pas se terminer par un point' };
  }
  
  if (email.includes('@.') || email.includes('.@')) {
    return { isValid: false, error: 'Email contient des caractères invalides autour de @' };
  }
  
  // Vérifier la longueur
  if (email.length > 254) {
    return { isValid: false, error: 'Email trop long' };
  }
  
  // Vérifier les domaines connus problématiques
  const problematicDomains = [
    'gmail.com.com',
    'yahoo.com.com',
    'outlook.com.com',
    'hotmail.com.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (problematicDomains.includes(domain)) {
    return { isValid: false, error: `Domaine problématique détecté: ${domain}` };
  }
  
  return { isValid: true };
};

// Fonction pour nettoyer une adresse email
export const cleanEmail = (email: string): string => {
  return email.trim().toLowerCase();
};
