import { NextRequest, NextResponse } from 'next/server';
import { getAllBusinessCards, createBusinessCard } from '@/lib/firebase';

// GET /api/admin/business-cards - Get all business cards
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limitCount = limitParam ? parseInt(limitParam) : undefined;

    const businessCards = await getAllBusinessCards(limitCount);
    return NextResponse.json(businessCards);
  } catch (error) {
    console.error('Error fetching business cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/business-cards - Create a new business card
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Vérifier si une carte avec cet email existe déjà
    const existingCards = await getAllBusinessCards();
    const emailExists = existingCards.some(card => 
      card.email && card.email.toLowerCase() === data.email?.toLowerCase()
    );
    
    if (emailExists) {
      return NextResponse.json({ 
        error: 'Une carte de visite avec cet email existe déjà' 
      }, { status: 400 });
    }
    
    const cardId = await createBusinessCard(data);
    
    // Retourner la carte créée
    const cards = await getAllBusinessCards();
    const newCard = cards.find(card => card.id === cardId);
    
    return NextResponse.json(newCard);
  } catch (error) {
    console.error('Error creating business card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
