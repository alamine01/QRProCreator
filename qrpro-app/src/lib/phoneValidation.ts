/**
 * Fonctions de validation et formatage des numéros de téléphone internationaux
 */

/**
 * Valide un numéro de téléphone international
 * @param phone - Le numéro de téléphone à valider
 * @returns true si le numéro est valide, false sinon
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Nettoyer le numéro (supprimer espaces, tirets, etc.)
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Regex pour les numéros internationaux
  // Format: + suivi de 7 à 15 chiffres
  // Ou directement 7 à 15 chiffres
  const phoneRegex = /^(\+)?[0-9]{7,15}$/;
  
  return phoneRegex.test(cleanPhone);
}

/**
 * Formate un numéro de téléphone pour l'affichage
 * @param phone - Le numéro de téléphone à formater
 * @returns Le numéro formaté avec des espaces
 */
export function formatPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Nettoyer le numéro
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si le numéro commence par +, le garder
  const hasPlus = cleanPhone.startsWith('+');
  const phoneNumber = hasPlus ? cleanPhone.substring(1) : cleanPhone;
  
  // Vérifier que c'est un numéro valide
  if (!/^[0-9]{7,15}$/.test(phoneNumber)) {
    return phone; // Retourner le numéro original si invalide
  }

  // Formater en groupes de 2-3 chiffres selon la longueur
  let formatted = '';
  if (phoneNumber.length <= 9) {
    // Format court (ex: 77 123 45 67)
    formatted = phoneNumber.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  } else {
    // Format long (ex: +33 1 23 45 67 89)
    formatted = phoneNumber.replace(/(\d{2})(\d{1,3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return hasPlus ? '+' + formatted : formatted;
}

/**
 * Normalise un numéro de téléphone pour le stockage
 * @param phone - Le numéro de téléphone à normaliser
 * @returns Le numéro normalisé avec le préfixe + si nécessaire
 */
export function normalizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Nettoyer le numéro
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si le numéro commence déjà par +, le retourner tel quel
  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }
  
  // Si c'est juste des chiffres, ajouter le +
  if (/^[0-9]{7,15}$/.test(cleanPhone)) {
    return '+' + cleanPhone;
  }
  
  // Retourner le numéro original si aucun format reconnu
  return phone;
}

/**
 * Obtient le message d'erreur pour un numéro de téléphone invalide
 * @param phone - Le numéro de téléphone
 * @returns Le message d'erreur approprié
 */
export function getPhoneValidationError(phone: string): string {
  if (!phone || phone.trim() === '') {
    return 'Le numéro de téléphone est requis';
  }

  if (!validatePhone(phone)) {
    return 'Format de numéro de téléphone invalide';
  }

  return '';
}
