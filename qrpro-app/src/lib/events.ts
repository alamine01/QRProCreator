import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Event, 
  EventCheckin, 
  CreateEventData, 
  UpdateEventData, 
  CheckinData,
  EventStats 
} from '../types/events';

// Collection references
const eventsCollection = collection(db, 'events');
const checkinsCollection = collection(db, 'event_checkins');

/**
 * Créer un nouvel événement
 */
export const createEvent = async (eventData: CreateEventData): Promise<string> => {
  try {
    console.log('createEvent: Début de la création de l\'événement');
    console.log('createEvent: Données reçues:', eventData);
    
    const eventToCreate = {
      ...eventData,
      date: Timestamp.fromDate(eventData.date),
      qrCode: '', // Sera généré après création
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('createEvent: Événement à créer:', eventToCreate);
    
    const docRef = await addDoc(eventsCollection, eventToCreate);
    console.log('createEvent: Événement créé avec l\'ID:', docRef.id);
    
    // Générer le QR code après création
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/event/${docRef.id}/checkin`;
    await updateDoc(docRef, { 
      qrCode: qrCodeUrl,
      updatedAt: serverTimestamp()
    });

    console.log('createEvent: QR code généré:', qrCodeUrl);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    throw error;
  }
};

/**
 * Récupérer un événement par son ID
 */
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    console.log('getEventById: Début de la récupération de l\'événement:', eventId);
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    console.log('getEventById: Document récupéré:', eventDoc.exists());
    
    if (!eventDoc.exists()) {
      console.log('getEventById: Document n\'existe pas');
      return null;
    }

    const eventData = {
      id: eventDoc.id,
      ...eventDoc.data()
    } as Event;
    
    console.log('getEventById: Événement récupéré:', eventData);
    console.log('getEventById: Date brute:', eventDoc.data()?.date);
    console.log('getEventById: Type de date:', typeof eventDoc.data()?.date);
    console.log('getEventById: Date convertie:', eventData.date);
    console.log('getEventById: Date de création brute:', eventDoc.data()?.createdAt);
    console.log('getEventById: Type de createdAt:', typeof eventDoc.data()?.createdAt);
    console.log('getEventById: Date de création convertie:', eventData.createdAt);
    
    return eventData;
  } catch (error) {
    console.error('getEventById: Erreur lors de la récupération de l\'événement:', error);
    throw error;
  }
};

/**
 * Récupérer tous les événements
 */
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    console.log('getAllEvents: Début de la récupération des événements');
    const q = query(eventsCollection, orderBy('createdAt', 'desc'));
    console.log('getAllEvents: Requête créée');
    const querySnapshot = await getDocs(q);
    console.log('getAllEvents: Requête exécutée, nombre de documents:', querySnapshot.docs.length);
    
    const events = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convertir les timestamps Firebase en dates JavaScript
        date: data.date?.toDate ? data.date.toDate() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      };
    }) as Event[];
    
    console.log('getAllEvents: Événements mappés:', events.length);
    return events;
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    throw error;
  }
};

/**
 * Récupérer les événements d'un propriétaire
 */
export const getEventsByOwner = async (ownerId: string): Promise<Event[]> => {
  try {
    // Essayer d'abord avec orderBy, sinon sans
    let querySnapshot;
    try {
      const q = query(
        eventsCollection, 
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (orderByError) {
      // Si orderBy échoue, essayer sans
      const q = query(eventsCollection, where('ownerId', '==', ownerId));
      querySnapshot = await getDocs(q);
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convertir les timestamps Firebase en dates JavaScript
        date: data.date?.toDate ? data.date.toDate() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      };
    }) as Event[];
  } catch (error) {
    console.error('Erreur lors de la récupération des événements du propriétaire:', error);
    throw error;
  }
};

/**
 * Récupérer les événements où l'utilisateur est collaborateur
 */
export const getEventsByCollaborator = async (userId: string): Promise<Event[]> => {
  try {
    // Essayer d'abord avec orderBy, sinon sans
    let querySnapshot;
    try {
      const q = query(
        eventsCollection, 
        where('collaborators', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (orderByError) {
      // Si orderBy échoue, essayer sans
      const q = query(eventsCollection, where('collaborators', 'array-contains', userId));
      querySnapshot = await getDocs(q);
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convertir les timestamps Firebase en dates JavaScript
        date: data.date?.toDate ? data.date.toDate() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      };
    }) as Event[];
  } catch (error) {
    console.error('Erreur lors de la récupération des événements collaborateur:', error);
    throw error;
  }
};

/**
 * Mettre à jour un événement
 */
export const updateEvent = async (eventId: string, updates: UpdateEventData): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Convertir la date si elle est fournie
    if (updates.date && updates.date instanceof Date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(eventRef, updateData);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    throw error;
  }
};

/**
 * Supprimer un événement
 */
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    throw error;
  }
};

/**
 * Ajouter un collaborateur à un événement
 */
export const addEventCollaborator = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Événement non trouvé');
    }

    const eventData = eventDoc.data() as Event;
    const collaborators = [...eventData.collaborators];
    
    if (!collaborators.includes(userId)) {
      collaborators.push(userId);
      await updateDoc(eventRef, {
        collaborators,
        updatedAt: serverTimestamp()
      });
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du collaborateur:', error);
    throw error;
  }
};

/**
 * Retirer un collaborateur d'un événement
 */
export const removeEventCollaborator = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Événement non trouvé');
    }

    const eventData = eventDoc.data() as Event;
    const collaborators = eventData.collaborators.filter(id => id !== userId);
    
    await updateDoc(eventRef, {
      collaborators,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du collaborateur:', error);
    throw error;
  }
};

/**
 * Récupérer les check-ins d'un événement
 */
export const getEventCheckins = async (eventId: string): Promise<EventCheckin[]> => {
  try {
    const q = query(
      checkinsCollection,
      where('eventId', '==', eventId),
      orderBy('checkedInAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventCheckin[];
  } catch (error) {
    console.error('Erreur lors de la récupération des check-ins:', error);
    throw error;
  }
};

/**
 * Ajouter un check-in
 */
export const addEventCheckin = async (checkinData: CheckinData): Promise<string> => {
  try {
    const checkinToCreate = {
      ...checkinData,
      checkedInAt: serverTimestamp(),
    };

    const docRef = await addDoc(checkinsCollection, checkinToCreate);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du check-in:', error);
    throw error;
  }
};

/**
 * Récupérer les statistiques d'un événement
 */
export const getEventStats = async (eventId: string): Promise<EventStats> => {
  try {
    const checkins = await getEventCheckins(eventId);
    
    const stats: EventStats = {
      totalCheckins: checkins.length,
      checkinsByHour: {},
      checkinsByDate: {},
      averageCheckinTime: 0,
      averageCheckinsPerHour: 0,
      peakHour: ''
    };

    if (checkins.length === 0) {
      return stats;
    }

    // Calculer les statistiques par heure
    checkins.forEach(checkin => {
      const date = checkin.checkedInAt.toDate();
      const hour = date.getHours().toString().padStart(2, '0');
      const dateStr = date.toISOString().split('T')[0];
      
      stats.checkinsByHour[hour] = (stats.checkinsByHour[hour] || 0) + 1;
      stats.checkinsByDate[dateStr] = (stats.checkinsByDate[dateStr] || 0) + 1;
    });

    // Trouver l'heure de pointe
    const peakHourEntry = Object.entries(stats.checkinsByHour)
      .sort(([,a], [,b]) => b - a)[0];
    stats.peakHour = peakHourEntry ? peakHourEntry[0] : '';

    // Calculer l'heure moyenne de check-in
    const totalMinutes = checkins.reduce((sum, checkin) => {
      const date = checkin.checkedInAt.toDate();
      return sum + (date.getHours() * 60 + date.getMinutes());
    }, 0);
    
    stats.averageCheckinTime = totalMinutes / checkins.length;

    // Calculer la moyenne de check-ins par heure
    const totalHours = Object.keys(stats.checkinsByHour).length;
    stats.averageCheckinsPerHour = totalHours > 0 ? 
      Object.values(stats.checkinsByHour).reduce((sum, count) => sum + count, 0) / totalHours : 0;

    return stats;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    throw error;
  }
};

/**
 * Vérifier si un utilisateur peut accéder à un événement
 */
export const canUserAccessEvent = async (eventId: string, userId: string, isAdmin: boolean = false): Promise<boolean> => {
  try {
    if (isAdmin) return true;
    
    const event = await getEventById(eventId);
    if (!event) return false;
    
    return event.ownerId === userId || event.collaborators.includes(userId);
  } catch (error) {
    console.error('Erreur lors de la vérification d\'accès:', error);
    return false;
  }
};

/**
 * Générer un QR code pour un événement
 */
export const generateEventQRCode = (eventId: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/event/${eventId}/checkin`;
};
