import bcrypt from 'bcryptjs';

/**
 * Génère un mot de passe sécurisé de 8 caractères
 * Format: 2 lettres majuscules + 2 lettres minuscules + 2 chiffres + 2 symboles
 */
export function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  let password = '';
  
  // Ajouter 2 lettres majuscules
  for (let i = 0; i < 2; i++) {
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
  }
  
  // Ajouter 2 lettres minuscules
  for (let i = 0; i < 2; i++) {
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
  }
  
  // Ajouter 2 chiffres
  for (let i = 0; i < 2; i++) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  // Ajouter 2 symboles
  for (let i = 0; i < 2; i++) {
    password += symbols[Math.floor(Math.random() * symbols.length)];
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Hash un mot de passe avec bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Vérifie un mot de passe contre son hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

