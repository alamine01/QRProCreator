import { NextRequest, NextResponse } from 'next/server';
import { getEventById, addEventCheckin } from '@/lib/events';
import { sendCheckinNotification } from '@/lib/eventNotifications';
import { CheckinData } from '@/types/events';

// POST /api/event/[id]/checkin - Enregistrer un check-in public
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

    // Vérifier que l'événement existe et est actif
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cet événement n\'est plus actif' },
        { status: 400 }
      );
    }

    // Validation des champs requis
    const requiredFields = event.formConfig.fields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!body[field.id] || body[field.id].trim() === '') {
        return NextResponse.json(
          { success: false, error: `Le champ ${field.label} est requis` },
          { status: 400 }
        );
      }
    }

    // Validation spécifique par type de champ
    for (const field of event.formConfig.fields) {
      const value = body[field.id];
      
      if (value && value.trim() !== '') {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              return NextResponse.json(
                { success: false, error: `Le champ ${field.label} doit être un email valide` },
                { status: 400 }
              );
            }
            break;
          case 'phone':
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(value)) {
              return NextResponse.json(
                { success: false, error: `Le champ ${field.label} doit être un numéro de téléphone valide` },
                { status: 400 }
              );
            }
            break;
        }
      }
    }

    // Préparer les données du check-in
    const guestInfo: Record<string, any> = {};
    
    // Ajouter les champs du formulaire
    for (const field of event.formConfig.fields) {
      const value = body[field.id];
      if (value !== undefined && value !== null) {
        guestInfo[field.id] = typeof value === 'string' ? value.trim() : value;
      }
    }

    // Ajouter les champs personnalisés
    if (body.customFields) {
      Object.assign(guestInfo, body.customFields);
    }

    const checkinData: CheckinData = {
      eventId,
      guestInfo,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    const checkinId = await addEventCheckin(checkinData);
    
    // Envoyer les notifications (en arrière-plan)
    try {
      // Récupérer l'email du propriétaire (nécessite une requête supplémentaire)
      // Pour l'instant, on skip les notifications si pas d'email disponible
      if (event.ownerId) {
        // TODO: Récupérer l'email du propriétaire depuis la base de données
        // await sendCheckinNotification(event, checkin, ownerEmail);
      }
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi des notifications:', notificationError);
      // Ne pas faire échouer le check-in si les notifications échouent
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        checkinId,
        eventName: event.name,
        guestName: `${guestInfo.firstName || ''} ${guestInfo.lastName || ''}`.trim()
      },
      message: 'Check-in enregistré avec succès !' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du check-in:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'enregistrement du check-in' },
      { status: 500 }
    );
  }
}

// GET /api/event/[id]/checkin - Récupérer les informations de l'événement pour le formulaire
export async function GET(
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

    const event = await getEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cet événement n\'est plus actif' },
        { status: 400 }
      );
    }

    // Retourner seulement les informations nécessaires pour le formulaire
    const eventInfo = {
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      location: event.location,
      type: event.type,
      formConfig: event.formConfig,
      qrCode: event.qrCode
    };

    return NextResponse.json({ 
      success: true, 
      data: eventInfo 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'événement' },
      { status: 500 }
    );
  }
}
