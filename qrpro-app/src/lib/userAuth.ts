import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { User, RegisterFormData } from '@/types';
import { hashPassword, generateProfileSlug, verifyPassword } from './auth';

/**
 * Crée un nouvel utilisateur avec mot de passe
 */
export async function createUserWithPassword(userData: RegisterFormData): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    // Vérifier si l'email existe déjà
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, error: 'Un compte avec cet email existe déjà.' };
    }

    const hashedPassword = await hashPassword(userData.password);
    const profileSlug = await generateProfileSlug(userData.firstName, userData.lastName);

    const newUser: Omit<User, 'id'> = {
      googleId: '',
      email: userData.email.toLowerCase(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileSlug,
      isAdmin: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      passwordHash: hashedPassword,
      mustChangePassword: false, // Pas de changement forcé pour les inscriptions manuelles
      accountType: 'manual',
    };

    const userRef = await addDoc(collection(db, 'users'), newUser);
    const createdUser = { id: userRef.id, ...newUser } as User;

    return { success: true, user: createdUser };
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return { success: false, error: 'Erreur lors de la création du compte.' };
  }
}

/**
 * Crée un utilisateur temporaire pour l'assignation d'autocollant
 */
export async function createTempUserForSticker(
  firstName: string,
  lastName: string,
  email: string
): Promise<{
  success: boolean;
  user?: User;
  tempPassword?: string;
  error?: string;
}> {
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'Un compte avec cet email existe déjà.' };
    }

    const tempPassword = `${firstName.toLowerCase()}123`;
    const hashedPassword = await hashPassword(tempPassword);
    const profileSlug = await generateProfileSlug(firstName, lastName);

    const newUser: Omit<User, 'id'> = {
      googleId: '',
      email: email.toLowerCase(),
      firstName,
      lastName,
      profileSlug,
      isAdmin: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      passwordHash: hashedPassword,
      tempPassword: tempPassword, // Stocker temporairement pour l'affichage admin
      mustChangePassword: true, // Forcer le changement à la première connexion
      accountType: 'manual',
    };

    const userRef = await addDoc(collection(db, 'users'), newUser);
    const createdUser = { id: userRef.id, ...newUser } as User;

    return { success: true, user: createdUser, tempPassword };
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur temporaire:', error);
    return { success: false, error: 'Erreur lors de la création du compte temporaire.' };
  }
}

/**
 * Récupère un utilisateur par email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const usersQuery = query(
    collection(db, 'users'),
    where('email', '==', email.toLowerCase())
  );
  const usersSnapshot = await getDocs(usersQuery);

  if (usersSnapshot.empty) {
    return null;
  }

  return { id: usersSnapshot.docs[0].id, ...usersSnapshot.docs[0].data() } as User;
}

/**
 * Vérifie les identifiants de l'utilisateur (email/password)
 */
export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    if (!user.passwordHash) {
      return {
        success: false,
        error: 'Ce compte utilise la connexion Google. Veuillez vous connecter avec Google.'
      };
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect'
      };
    }

    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des identifiants:', error);
    return {
      success: false,
      error: 'Erreur lors de la connexion'
    };
  }
}

/**
 * Met à jour le mot de passe d'un utilisateur
 */
export async function updateUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    const user = userSnap.data() as User;

    // Vérifier le mot de passe actuel
    if (!user.passwordHash) {
      return { success: false, error: 'Ce compte n\'a pas de mot de passe défini' };
    }

    const isValidCurrentPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValidCurrentPassword) {
      return { success: false, error: 'Mot de passe actuel incorrect' };
    }

    const newHashedPassword = await hashPassword(newPassword);

    await updateDoc(userRef, {
      passwordHash: newHashedPassword,
      tempPassword: null, // Supprimer le mot de passe temporaire
      mustChangePassword: false, // Le mot de passe a été changé
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    return { success: false, error: 'Erreur lors de la mise à jour du mot de passe' };
  }
}
