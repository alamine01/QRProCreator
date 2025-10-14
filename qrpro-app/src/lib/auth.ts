import bcrypt from 'bcryptjs';

/**
 * Hash un mot de passe avec bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Vérifie un mot de passe hashé
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Valide la force du mot de passe
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre.');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial.');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Valide le format d'une adresse email
 */
export function validateEmail(email: string): boolean {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Génère un slug unique pour le profil utilisateur
 */
export async function generateProfileSlug(firstName: string, lastName: string): Promise<string> {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const { db } = await import('./firebase');
  
  const baseSlug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/[^a-z0-9-]/g, '');
  let profileSlug = baseSlug;
  let counter = 1;
  
  // Vérifier l'unicité du slug
  while (true) {
    const slugQuery = query(
      collection(db, 'users'),
      where('profileSlug', '==', profileSlug)
    );
    const slugSnapshot = await getDocs(slugQuery);
    
    if (slugSnapshot.empty) break;
    
    profileSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return profileSlug;
}
