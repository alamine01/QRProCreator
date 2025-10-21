import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, getEventsByOwner, getEventsByCollaborator, createEvent, getEventById, updateEvent, deleteEvent } from '@/lib/events';
import { CreateEventData, UpdateEventData } from '@/types/events';

// GET /api/admin/events - Récupérer tous les événements
export async function GET(request: NextRequest) {
  try {
    console.log('API GET /api/admin/events appelée');
    
    // Pour l'instant, permettre l'accès sans authentification pour le débogage
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const collaboratorId = searchParams.get('collaboratorId');
    
    console.log('Paramètres:', { ownerId, collaboratorId });
    
    let events;
    
    if (ownerId) {
      console.log('Récupération des événements par propriétaire:', ownerId);
      events = await getEventsByOwner(ownerId);
    } else if (collaboratorId) {
      console.log('Récupération des événements par collaborateur:', collaboratorId);
      events = await getEventsByCollaborator(collaboratorId);
    } else {
      console.log('Récupération de tous les événements');
      events = await getAllEvents();
    }
    
    console.log('Événements récupérés:', events.length);
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}

// POST /api/admin/events - Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    console.log('API POST /api/admin/events appelée');
    
    const body = await request.json();
    console.log('API POST: Corps de la requête reçu:', body);
    
    // Validation des données requises
    const requiredFields = ['name', 'description', 'date', 'location', 'type', 'ownerId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log('API POST: Champ manquant:', field);
        return NextResponse.json(
          { success: false, error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Validation du type d'événement
    if (!['with_preregistration', 'without_preregistration'].includes(body.type)) {
      console.log('API POST: Type d\'événement invalide:', body.type);
      return NextResponse.json(
        { success: false, error: 'Type d\'événement invalide' },
        { status: 400 }
      );
    }

    // Validation de la date
    const eventDate = new Date(body.date);
    if (isNaN(eventDate.getTime())) {
      console.log('API POST: Date invalide:', body.date);
      return NextResponse.json(
        { success: false, error: 'Date invalide' },
        { status: 400 }
      );
    }

    console.log('API POST: Validation réussie, création de l\'événement...');

    // Préparer les données de l'événement
    const eventData: CreateEventData = {
      name: body.name.trim(),
      description: body.description.trim(),
      date: eventDate,
      location: body.location.trim(),
      type: body.type,
      ownerId: body.ownerId,
      collaborators: body.collaborators || [],
      formConfig: {
        fields: body.formConfig?.fields || [
          {
            id: 'firstName',
            label: 'Prénom',
            type: 'text',
            required: true,
            placeholder: 'Votre prénom'
          },
          {
            id: 'lastName',
            label: 'Nom',
            type: 'text',
            required: true,
            placeholder: 'Votre nom'
          },
          {
            id: 'phone',
            label: 'Téléphone',
            type: 'phone',
            required: true,
            placeholder: 'Votre numéro de téléphone'
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email',
            required: false,
            placeholder: 'Votre adresse email'
          }
        ],
        colors: body.formConfig?.colors || {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          background: '#F8FAFC',
          text: '#1F2937'
        },
        logo: body.formConfig?.logo,
        welcomeMessage: body.formConfig?.welcomeMessage || 'Bienvenue à notre événement !'
      }
    };

    const eventId = await createEvent(eventData);
    
    return NextResponse.json({ 
      success: true, 
      data: { eventId },
      message: 'Événement créé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    );
  }
}
