import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Sticker, User } from '@/types';
import { createTempUserForSticker, getUserByEmail } from '@/lib/userAuth';

// POST - Assigner un autocollant à un client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stickerId, customerName, customerEmail } = body;

    if (!stickerId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Valider l'email
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'autocollant existe et est disponible (dans businessCards temporairement)
    const stickerRef = doc(db, 'businessCards', stickerId);
    const stickerSnap = await getDoc(stickerRef);
    
    if (!stickerSnap.exists()) {
      return NextResponse.json(
        { error: 'Autocollant non trouvé' },
        { status: 404 }
      );
    }

    const sticker = stickerSnap.data() as Sticker;
    
    if (sticker.status !== 'available') {
      return NextResponse.json(
        { error: 'Cet autocollant est déjà assigné' },
        { status: 400 }
      );
    }

    // Vérifier si un utilisateur avec cet email existe déjà
    const existingUser = await getUserByEmail(customerEmail);
    
    let userId: string;
    let isNewUser = false;
    let tempPassword: string | undefined;

    if (!existingUser) {
      // Créer un nouveau compte utilisateur temporaire
      const [firstName, ...lastNameParts] = customerName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      let tempPassword = `${firstName.toLowerCase()}123`;
      
      try {
        // Créer l'utilisateur dans Firebase Auth d'abord
        const firebaseUser = await createUserWithEmailAndPassword(auth, customerEmail, tempPassword);
        
        // Créer le profil dans Firestore
        const result = await createTempUserForSticker(firstName, lastName, customerEmail, firebaseUser.user.uid);
        
        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 400 }
          );
        }
        
        userId = result.user!.id;
        isNewUser = true;
      } catch (firebaseError: any) {
        console.error('Erreur création Firebase Auth:', firebaseError);
        return NextResponse.json(
          { error: `Erreur lors de la création du compte: ${firebaseError.message}` },
          { status: 400 }
        );
      }
    } else {
      // Utiliser le compte existant
      userId = existingUser.id;
      isNewUser = false;
    }

    // Assigner l'autocollant à l'utilisateur
    await updateDoc(stickerRef, {
      status: 'assigned',
      assignedUserId: userId,
      assignedAt: serverTimestamp()
    });

    // Note: La création de carte de visite a été supprimée
    // L'utilisateur devra créer sa propre carte de visite via le dashboard

    return NextResponse.json({
      message: isNewUser 
        ? 'Nouveau compte créé et autocollant assigné avec succès' 
        : 'Autocollant assigné au compte existant',
      userId,
      isNewUser,
      tempPassword: isNewUser ? tempPassword : undefined,
      accountType: 'manual',
      note: isNewUser 
        ? `Mot de passe temporaire: ${tempPassword} (le client devra le changer à la première connexion et créer sa carte de visite)`
        : 'Le client peut utiliser ses identifiants existants et devra créer sa carte de visite'
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation de l\'autocollant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'assignation de l\'autocollant' },
      { status: 500 }
    );
  }
}
