import { NextRequest, NextResponse } from 'next/server';
import { getAllBusinessCards } from '@/lib/firebase';

// GET /api/business-card/[slug] - Get a specific business card by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Récupérer toutes les cartes et trouver celle qui correspond au slug
    const cards = await getAllBusinessCards();
    const card = cards.find(c => c.uniqueId === slug || c.id === slug);

    if (!card) {
      return NextResponse.json({ error: 'Business card not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error fetching business card by slug:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
