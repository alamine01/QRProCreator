import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
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
      
      const result = await createTempUserForSticker(firstName, lastName, customerEmail);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      
      userId = result.user!.id;
      tempPassword = result.tempPassword;
      isNewUser = true;
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

    // Si c'est un nouvel utilisateur, créer une carte de visite basée sur le profil aléatoire
    if (isNewUser) {
      const businessCard = {
        name: sticker.randomProfile.firstName + ' ' + sticker.randomProfile.lastName,
        title: sticker.randomProfile.profession,
        company: sticker.randomProfile.company,
        bio: sticker.randomProfile.bio,
        phonePrimary: sticker.randomProfile.phone,
        email: customerEmail.toLowerCase(),
        location: 'Dakar, Sénégal',
        isActive: true,
        uniqueId: sticker.qrCode,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'businessCards'), businessCard);
    }

    return NextResponse.json({
      message: isNewUser 
        ? 'Nouveau compte créé et autocollant assigné avec succès' 
        : 'Autocollant assigné au compte existant',
      userId,
      isNewUser,
      tempPassword: isNewUser ? tempPassword : undefined,
      accountType: 'manual',
      note: isNewUser 
        ? `Mot de passe temporaire: ${tempPassword} (le client devra le changer à la première connexion)`
        : 'Le client peut utiliser ses identifiants existants'
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation de l\'autocollant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'assignation de l\'autocollant' },
      { status: 500 }
    );
  }
}
