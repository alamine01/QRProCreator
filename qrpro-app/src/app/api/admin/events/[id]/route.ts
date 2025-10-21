import { NextRequest, NextResponse } from 'next/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/events';
import { UpdateEventData } from '@/types/events';

// GET /api/admin/events/[id] - Récupérer un événement spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API GET /api/admin/events/[id] appelée');
    const { id: eventId } = await params;
    console.log('API GET: ID de l\'événement:', eventId);
    
    if (!eventId) {
      console.log('API GET: ID d\'événement manquant');
      return NextResponse.json(
        { success: false, error: 'ID d\'événement requis' },
        { status: 400 }
      );
    }

    console.log('API GET: Appel de getEventById avec:', eventId);
    const event = await getEventById(eventId);
    console.log('API GET: Événement récupéré:', event ? 'Oui' : 'Non');
    
    if (!event) {
      console.log('API GET: Événement non trouvé');
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    console.log('API GET: Retour de l\'événement avec succès');
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('API GET: Erreur lors de la récupération de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'événement' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/events/[id] - Mettre à jour un événement
export async function PUT(
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

    // Vérifier que l'événement existe
    const existingEvent = await getEventById(eventId);
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // Validation du type d'événement si fourni
    if (body.type && !['with_preregistration', 'without_preregistration'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Type d\'événement invalide' },
        { status: 400 }
      );
    }

    // Validation de la date si fournie
    if (body.date) {
      const eventDate = new Date(body.date);
      if (isNaN(eventDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Date invalide' },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: UpdateEventData = {};
    
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.location !== undefined) updateData.location = body.location.trim();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.collaborators !== undefined) updateData.collaborators = body.collaborators;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    if (body.formConfig !== undefined) {
      updateData.formConfig = {
        fields: body.formConfig.fields || existingEvent.formConfig.fields,
        colors: body.formConfig.colors || existingEvent.formConfig.colors,
        logo: body.formConfig.logo,
        welcomeMessage: body.formConfig.welcomeMessage || existingEvent.formConfig.welcomeMessage
      };
    }

    const success = await updateEvent(eventId, updateData);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de l\'événement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Événement mis à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'événement' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id] - Supprimer un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'ID d\'événement requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe
    const existingEvent = await getEventById(eventId);
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    const success = await deleteEvent(eventId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de l\'événement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Événement supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'événement' },
      { status: 500 }
    );
  }
}
