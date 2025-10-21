import { NextRequest, NextResponse } from 'next/server';
import { getEventCheckins, addEventCheckin } from '@/lib/events';
import { CheckinData } from '@/types/events';

// GET /api/admin/events/[id]/checkins - Récupérer les check-ins d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'ID d\'événement requis' },
        { status: 400 }
      );
    }

    const allCheckins = await getEventCheckins(eventId);
    
    // Filtrer par recherche si fournie
    let filteredCheckins = allCheckins;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCheckins = allCheckins.filter(checkin => 
        checkin.guestInfo.firstName?.toLowerCase().includes(searchLower) ||
        checkin.guestInfo.lastName?.toLowerCase().includes(searchLower) ||
        checkin.guestInfo.email?.toLowerCase().includes(searchLower) ||
        checkin.guestInfo.phone?.includes(search) ||
        checkin.guestInfo.company?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCheckins = filteredCheckins.slice(startIndex, endIndex);

    return NextResponse.json({ 
      success: true, 
      data: {
        checkins: paginatedCheckins,
        pagination: {
          page,
          limit,
          total: filteredCheckins.length,
          totalPages: Math.ceil(filteredCheckins.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des check-ins:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des check-ins' },
      { status: 500 }
    );
  }
}

// POST /api/admin/events/[id]/checkins - Ajouter un check-in manuel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'ID d\'événement requis' },
        { status: 400 }
      );
    }

    // Validation des données requises
    const requiredFields = ['firstName', 'lastName', 'phone'];
    for (const field of requiredFields) {
      if (!body.guestInfo || !body.guestInfo[field]) {
        return NextResponse.json(
          { success: false, error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Préparer les données du check-in
    const checkinData: CheckinData = {
      eventId,
      guestInfo: {
        firstName: body.guestInfo.firstName.trim(),
        lastName: body.guestInfo.lastName.trim(),
        phone: body.guestInfo.phone.trim(),
        email: body.guestInfo.email?.trim(),
        company: body.guestInfo.company?.trim(),
        address: body.guestInfo.address?.trim(),
        ...body.guestInfo.customFields
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    const checkinId = await addEventCheckin(checkinData);
    
    return NextResponse.json({ 
      success: true, 
      data: { checkinId },
      message: 'Check-in ajouté avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du check-in:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'ajout du check-in' },
      { status: 500 }
    );
  }
}
