// import { sendEmail } from './email';
import { Event, EventCheckin } from '@/types/events';

// Fonction temporaire pour remplacer sendEmail
const sendEmail = async (data: any) => {
  console.log('Email simulation:', data);
  return Promise.resolve();
};

interface NotificationData {
  eventName: string;
  guestName: string;
  guestEmail?: string;
  checkinTime: string;
  eventDate: string;
  eventLocation: string;
}

/**
 * Envoyer une notification de nouveau check-in
 */
export const sendCheckinNotification = async (
  event: Event,
  checkin: EventCheckin,
  ownerEmail: string
) => {
  try {
    const guestName = `${checkin.guestInfo.firstName || ''} ${checkin.guestInfo.lastName || ''}`.trim();
    const checkinTime = checkin.checkedInAt.toDate().toLocaleString('fr-FR');
    const eventDate = event.date.toDate().toLocaleDateString('fr-FR');

    const notificationData: NotificationData = {
      eventName: event.name,
      guestName,
      guestEmail: checkin.guestInfo.email,
      checkinTime,
      eventDate,
      eventLocation: event.location
    };

    // Email au propriétaire de l'événement
    await sendEmail({
      to: ownerEmail,
      subject: `Nouveau check-in pour ${event.name}`,
      template: 'event-checkin-notification',
      data: notificationData
    });

    // Email de confirmation à l'invité (si email fourni)
    if (checkin.guestInfo.email) {
      await sendEmail({
        to: checkin.guestInfo.email,
        subject: `Confirmation de check-in - ${event.name}`,
        template: 'event-checkin-confirmation',
        data: notificationData
      });
    }

    console.log('Notifications envoyées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
  }
};

/**
 * Envoyer une notification de rappel d'événement
 */
export const sendEventReminder = async (
  event: Event,
  guestEmail: string,
  guestName: string
) => {
  try {
    const eventDate = event.date.toDate().toLocaleDateString('fr-FR');
    const eventTime = event.date.toDate().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const notificationData: NotificationData = {
      eventName: event.name,
      guestName,
      guestEmail,
      checkinTime: '',
      eventDate: `${eventDate} à ${eventTime}`,
      eventLocation: event.location
    };

    await sendEmail({
      to: guestEmail,
      subject: `Rappel: ${event.name} - ${eventDate}`,
      template: 'event-reminder',
      data: notificationData
    });

    console.log('Rappel d\'événement envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rappel:', error);
  }
};

/**
 * Envoyer une notification de modification d'événement
 */
export const sendEventUpdateNotification = async (
  event: Event,
  collaboratorEmails: string[]
) => {
  try {
    const eventDate = event.date.toDate().toLocaleDateString('fr-FR');
    const eventTime = event.date.toDate().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const notificationData: NotificationData = {
      eventName: event.name,
      guestName: '',
      checkinTime: '',
      eventDate: `${eventDate} à ${eventTime}`,
      eventLocation: event.location
    };

    // Envoyer à tous les collaborateurs
    for (const email of collaboratorEmails) {
      await sendEmail({
        to: email,
        subject: `Modification de l'événement ${event.name}`,
        template: 'event-update',
        data: notificationData
      });
    }

    console.log('Notifications de modification envoyées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de modification:', error);
  }
};

/**
 * Envoyer une notification d'invitation collaborateur
 */
export const sendCollaboratorInvitation = async (
  event: Event,
  collaboratorEmail: string,
  collaboratorName: string
) => {
  try {
    const eventDate = event.date.toDate().toLocaleDateString('fr-FR');
    const eventTime = event.date.toDate().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const notificationData: NotificationData = {
      eventName: event.name,
      guestName: collaboratorName,
      guestEmail: collaboratorEmail,
      checkinTime: '',
      eventDate: `${eventDate} à ${eventTime}`,
      eventLocation: event.location
    };

    await sendEmail({
      to: collaboratorEmail,
      subject: `Invitation à collaborer sur ${event.name}`,
      template: 'event-collaborator-invitation',
      data: notificationData
    });

    console.log('Invitation collaborateur envoyée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'invitation:', error);
  }
};

/**
 * Envoyer un rapport quotidien d'événement
 */
export const sendDailyEventReport = async (
  event: Event,
  ownerEmail: string,
  checkins: EventCheckin[]
) => {
  try {
    const eventDate = event.date.toDate().toLocaleDateString('fr-FR');
    const todayCheckins = checkins.filter(checkin => {
      const checkinDate = checkin.checkedInAt.toDate();
      const today = new Date();
      return checkinDate.toDateString() === today.toDateString();
    });

    const notificationData = {
      eventName: event.name,
      eventDate,
      eventLocation: event.location,
      totalCheckins: checkins.length,
      todayCheckins: todayCheckins.length,
      recentCheckins: todayCheckins.slice(0, 10).map(checkin => ({
        name: `${checkin.guestInfo.firstName || ''} ${checkin.guestInfo.lastName || ''}`.trim(),
        time: checkin.checkedInAt.toDate().toLocaleTimeString('fr-FR')
      }))
    };

    await sendEmail({
      to: ownerEmail,
      subject: `Rapport quotidien - ${event.name}`,
      template: 'event-daily-report',
      data: notificationData
    });

    console.log('Rapport quotidien envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rapport:', error);
  }
};
