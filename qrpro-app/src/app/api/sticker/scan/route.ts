import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { Sticker, User, BusinessCard } from '@/types';

// GET - Scanner un QR code et retourner les informations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qrCode = searchParams.get('qr');

    if (!qrCode) {
      return NextResponse.json(
        { error: 'Code QR requis' },
        { status: 400 }
      );
    }

    // Chercher l'autocollant par QR code (dans businessCards temporairement)
    const stickersQuery = query(
      collection(db, 'businessCards'),
      where('qrCode', '==', qrCode),
      where('isSticker', '==', true)
    );
    const stickersSnapshot = await getDocs(stickersQuery);

    if (stickersSnapshot.empty) {
      return NextResponse.json(
        { error: 'QR code non trouvé' },
        { status: 404 }
      );
    }

    const stickerDoc = stickersSnapshot.docs[0];
    const sticker = { id: stickerDoc.id, ...stickerDoc.data() } as Sticker;

    if (sticker.status === 'available') {
      // Autocollant disponible - retourner le code-barres
      return NextResponse.json({
        type: 'barcode',
        barcode: sticker.barcode,
        randomProfile: sticker.randomProfile,
        stickerId: sticker.id
      });
    } else if (sticker.status === 'assigned' && sticker.assignedUserId) {
      // Autocollant assigné - retourner le profil du client
      const userRef = doc(db, 'users', sticker.assignedUserId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      const user = { id: userSnap.id, ...userSnap.data() } as User;

      // Récupérer la carte de visite de l'utilisateur (celle qui correspond au QR de l'autocollant)
      const businessCardsQuery = query(
        collection(db, 'businessCards'),
        where('uniqueId', '==', sticker.qrCode),
        where('isActive', '==', true)
      );
      const businessCardsSnapshot = await getDocs(businessCardsQuery);
      
      let businessCard: BusinessCard | null = null;
      if (!businessCardsSnapshot.empty) {
        const cardDoc = businessCardsSnapshot.docs[0];
        businessCard = { id: cardDoc.id, ...cardDoc.data() } as BusinessCard;
      }

      return NextResponse.json({
        type: 'profile',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profession: user.profession,
          phone: user.phone,
          profilePicture: user.profilePicture,
          profileSlug: user.profileSlug,
          biography: user.biography,
          address: user.address,
          location: user.location,
          linkedin: user.linkedin,
          whatsapp: user.whatsapp,
          instagram: user.instagram,
          twitter: user.twitter,
          snapchat: user.snapchat,
          facebook: user.facebook,
          youtube: user.youtube,
          tiktok: user.tiktok
        },
        businessCard: businessCard ? {
          id: businessCard.id,
          name: businessCard.name,
          title: businessCard.title,
          company: businessCard.company,
          bio: businessCard.bio,
          phonePrimary: businessCard.phonePrimary,
          email: businessCard.email,
          location: businessCard.location,
          instagram: businessCard.instagram,
          whatsapp: businessCard.whatsapp,
          linkedin: businessCard.linkedin,
          facebook: businessCard.facebook,
          twitter: businessCard.twitter,
          snapchat: businessCard.snapchat,
          youtube: businessCard.youtube,
          tiktok: businessCard.tiktok
        } : null,
        assignedAt: sticker.assignedAt,
        createdAt: sticker.createdAt
      });
    }

    return NextResponse.json(
      { error: 'Statut d\'autocollant invalide' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erreur lors du scan du QR code:', error);
    return NextResponse.json(
      { error: 'Erreur lors du scan du QR code' },
      { status: 500 }
    );
  }
}
