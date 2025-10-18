import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Sticker } from '@/types';

// Générer un profil aléatoire
function generateRandomProfile() {
  const firstNames = [
    'Jean', 'Marie', 'Pierre', 'Sophie', 'Paul', 'Julie', 'Marc', 'Camille',
    'Antoine', 'Léa', 'Thomas', 'Emma', 'Nicolas', 'Chloé', 'Alexandre', 'Sarah',
    'David', 'Laura', 'Julien', 'Manon', 'Romain', 'Claire', 'Maxime', 'Léonie',
    'Baptiste', 'Océane', 'Lucas', 'Inès', 'Hugo', 'Lola', 'Gabriel', 'Zoé'
  ];

  const lastNames = [
    'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois',
    'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David',
    'Bertrand', 'Morel', 'Fournier', 'Girard', 'André', 'Lefèvre', 'Mercier', 'Dupont',
    'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau'
  ];

  const professions = [
    'Développeur', 'Designer', 'Commercial', 'Manager', 'Consultant', 'Analyste',
    'Chef de projet', 'Architecte', 'Ingénieur', 'Directeur', 'Responsable', 'Expert',
    'Spécialiste', 'Coordonnateur', 'Superviseur', 'Conseiller'
  ];

  const companies = [
    'TechCorp', 'InnovateLab', 'Digital Solutions', 'Future Systems', 'SmartTech',
    'NextGen', 'ProActive', 'Creative Minds', 'Elite Group', 'Vision Corp',
    'Dynamic Solutions', 'Advanced Systems', 'Prime Technologies', 'Excellence Inc',
    'Strategic Partners', 'Global Dynamics'
  ];

  const bios = [
    'Passionné par l\'innovation et les nouvelles technologies.',
    'Expert dans mon domaine avec une vision stratégique.',
    'Toujours à la recherche de nouveaux défis et opportunités.',
    'Dédié à l\'excellence et à la satisfaction client.',
    'Leader naturel avec une approche collaborative.',
    'Créatif et orienté résultats dans tous mes projets.',
    'Spécialiste reconnu avec une expertise approfondie.',
    'Motivé par l\'apprentissage continu et l\'amélioration.'
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const profession = professions[Math.floor(Math.random() * professions.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const bio = bios[Math.floor(Math.random() * bios.length)];

  // Générer un email aléatoire
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
  
  // Générer un numéro de téléphone aléatoire
  const phone = `+221${Math.floor(Math.random() * 90000000) + 10000000}`;

  return {
    firstName,
    lastName,
    profession,
    company,
    phone,
    email,
    bio
  };
}

// Générer un QR code unique
function generateQRCode(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `STK-${timestamp}-${random}`.toUpperCase();
}

// Générer un code-barres unique
function generateBarcode(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}${random}`.padStart(16, '0');
}

// GET - Récupérer tous les autocollants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const status = searchParams.get('status');
    
    // Récupérer les autocollants depuis la collection businessCards (temporaire)
    let q = query(
      collection(db, 'businessCards'), 
      where('isSticker', '==', true)
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    if (limitParam) {
      q = query(q, limit(parseInt(limitParam)));
    }
    
    const snapshot = await getDocs(q);
    const stickers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convertir les timestamps Firebase en dates JavaScript
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        assignedAt: data.assignedAt?.toDate ? data.assignedAt.toDate() : data.assignedAt
      };
    }) as Sticker[];

    return NextResponse.json({ stickers });
  } catch (error) {
    console.error('Erreur lors de la récupération des autocollants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des autocollants' },
      { status: 500 }
    );
  }
}

// POST - Créer des autocollants (5 par défaut)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const count = body.count || 5; // Par défaut 5 autocollants
    
    if (count < 1 || count > 10) {
      return NextResponse.json(
        { error: 'Le nombre doit être entre 1 et 10' },
        { status: 400 }
      );
    }

    const stickers = [];
    
    for (let i = 0; i < count; i++) {
      const sticker: Omit<Sticker, 'id'> = {
        qrCode: generateQRCode(),
        barcode: generateBarcode(),
        status: 'available',
        createdAt: serverTimestamp() as any,
        randomProfile: generateRandomProfile()
      };
      
      stickers.push(sticker);
    }

    // Ajouter tous les autocollants à Firestore un par un pour éviter les problèmes de batch
    // Utiliser temporairement la collection 'businessCards' qui a des règles ouvertes
    for (const sticker of stickers) {
      try {
        const stickerData = {
          ...sticker,
          type: 'sticker', // Marquer comme autocollant
          isSticker: true
        };
        await addDoc(collection(db, 'businessCards'), stickerData);
        console.log('✅ Autocollant créé:', sticker.qrCode);
      } catch (error) {
        console.error('❌ Erreur création autocollant:', sticker.qrCode, error);
        throw error;
      }
    }

    return NextResponse.json({ 
      message: `${count} autocollants créés avec succès`,
      count 
    });
  } catch (error) {
    console.error('Erreur lors de la création des autocollants:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création des autocollants',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
