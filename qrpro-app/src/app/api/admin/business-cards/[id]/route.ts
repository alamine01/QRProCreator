import { NextRequest, NextResponse } from 'next/server';
import { getAllBusinessCards, updateBusinessCard, deleteBusinessCard } from '@/lib/firebase';

// GET /api/admin/business-cards/[id] - Get a specific business card
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cards = await getAllBusinessCards();
    const card = cards.find(c => c.id === id);

    if (!card) {
      return NextResponse.json({ error: 'Business card not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error fetching business card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/business-cards/[id] - Update a business card
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Vérifier si une autre carte avec cet email existe déjà
    const existingCards = await getAllBusinessCards();
    const emailExists = existingCards.some(card => 
      card.id !== id && 
      card.email && 
      card.email.toLowerCase() === data.email?.toLowerCase()
    );
    
    if (emailExists) {
      return NextResponse.json({ 
        error: 'Une autre carte de visite avec cet email existe déjà' 
      }, { status: 400 });
    }
    
    const updatedCard = await updateBusinessCard(id, data);
    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating business card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/business-cards/[id] - Delete a business card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteBusinessCard(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting business card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
