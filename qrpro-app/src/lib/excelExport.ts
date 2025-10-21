/**
 * Utilitaires pour l'export Excel stylisé des listes de présence
 */

export interface CheckinData {
  id: string;
  guestInfo: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    [key: string]: any;
  };
  checkedInAt: any;
  [key: string]: any;
}

export interface EventData {
  id: string;
  name: string;
  description: string;
  date: any;
  location: string;
  ownerId: string;
  createdAt: any;
}

/**
 * Génère un fichier Excel stylisé pour les listes de présence
 */
export const exportStyledExcel = (
  checkins: CheckinData[],
  event: EventData,
  additionalInfo?: {
    organizerName?: string;
    organizerEmail?: string;
    organizerPhone?: string;
  }
) => {
  // Créer le contenu HTML stylisé
  const htmlContent = generateStyledHTML(checkins, event, additionalInfo);
  
  // Créer le blob avec le type Excel
  const blob = new Blob([htmlContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8' 
  });
  
  // Générer le nom de fichier
  const eventName = event.name.replace(/[^a-zA-Z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  const fileName = `Liste_Presence_${eventName}_${date}.xls`;
  
  // Télécharger le fichier
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Génère le contenu HTML stylisé pour Excel
 */
const generateStyledHTML = (
  checkins: CheckinData[],
  event: EventData,
  additionalInfo?: {
    organizerName?: string;
    organizerEmail?: string;
    organizerPhone?: string;
  }
): string => {
  const eventDate = formatEventDate(event.date);
  const creationDate = formatEventDate(event.createdAt);
  
  return `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:x="urn:schemas-microsoft-com:office:excel" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <meta name="ExcelCreated" content="QRPRO Events">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Liste de Présence</x:Name>
          <x:WorksheetOptions>
            <x:DefaultRowHeight>285</x:DefaultRowHeight>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background-color: #F15A22; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .header h2 { margin: 5px 0 0 0; font-size: 16px; font-weight: normal; }
    .event-info { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-left: 4px solid #F15A22; }
    .event-info h3 { margin: 0 0 10px 0; color: #F15A22; font-size: 18px; }
    .event-info p { margin: 5px 0; color: #333; }
    .stats { background-color: #e3f2fd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
    .stats h3 { margin: 0 0 10px 0; color: #1976d2; font-size: 16px; }
    .stats p { margin: 5px 0; color: #333; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background-color: #F15A22; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
    td { padding: 10px 8px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    tr:hover { background-color: #f5f5f5; }
    .footer { margin-top: 30px; padding: 15px; background-color: #f8f9fa; text-align: center; color: #666; font-size: 12px; }
    .qrpro-logo { color: #F15A22; font-weight: bold; }
    .total-checkins { background-color: #4caf50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
  </style>
</head>
<body>
  <!-- En-tête principal -->
  <div class="header">
    <h1>📋 LISTE DE PRÉSENCE</h1>
    <h2>${event.name}</h2>
  </div>

  <!-- Informations de l'événement -->
  <div class="event-info">
    <h3>📅 Informations de l'événement</h3>
    <p><strong>Nom :</strong> ${event.name}</p>
    <p><strong>Description :</strong> ${event.description}</p>
    <p><strong>Date :</strong> ${eventDate}</p>
    <p><strong>Lieu :</strong> ${event.location}</p>
    <p><strong>Date de création :</strong> ${creationDate}</p>
    ${additionalInfo?.organizerName ? `<p><strong>Organisateur :</strong> ${additionalInfo.organizerName}</p>` : ''}
    ${additionalInfo?.organizerEmail ? `<p><strong>Email organisateur :</strong> ${additionalInfo.organizerEmail}</p>` : ''}
    ${additionalInfo?.organizerPhone ? `<p><strong>Téléphone organisateur :</strong> ${additionalInfo.organizerPhone}</p>` : ''}
  </div>

  <!-- Statistiques -->
  <div class="stats">
    <h3>📊 Statistiques</h3>
    <p>Total des présences : <span class="total-checkins">${checkins.length} personne${checkins.length > 1 ? 's' : ''}</span></p>
    <p>Date d'export : ${new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
  </div>

  <!-- Tableau des présences -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Nom</th>
        <th>Prénom</th>
        <th>Email</th>
        <th>Téléphone</th>
        <th>Entreprise</th>
        <th>Heure d'arrivée</th>
        <th>Code de confirmation</th>
      </tr>
    </thead>
    <tbody>
      ${checkins.map((checkin, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${checkin.guestInfo.lastName || ''}</td>
          <td>${checkin.guestInfo.firstName || ''}</td>
          <td>${checkin.guestInfo.email || ''}</td>
          <td>${checkin.guestInfo.phone || ''}</td>
          <td>${checkin.guestInfo.company || ''}</td>
          <td>${formatCheckinTime(checkin.checkedInAt)}</td>
          <td>${checkin.id}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Pied de page -->
  <div class="footer">
    <p>Généré par <span class="qrpro-logo">QRPRO</span> - Système de gestion d'événements</p>
    <p>© ${new Date().getFullYear()} QRPRO. Tous droits réservés.</p>
  </div>
</body>
</html>
  `;
};

/**
 * Formate une date d'événement
 */
const formatEventDate = (date: any): string => {
  if (!date) return 'Non disponible';
  
  try {
    let dateObj: Date;
    
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    if (dateObj && !isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return 'Date invalide';
  } catch (error) {
    return 'Date invalide';
  }
};

/**
 * Formate l'heure de check-in
 */
const formatCheckinTime = (timestamp: any): string => {
  if (!timestamp) return 'Non disponible';
  
  try {
    let dateObj: Date;
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      dateObj = timestamp;
    } else {
      dateObj = new Date(timestamp);
    }
    
    if (dateObj && !isNaN(dateObj.getTime())) {
      return dateObj.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    return 'Heure invalide';
  } catch (error) {
    return 'Heure invalide';
  }
};

/**
 * Export CSV simple (fallback)
 */
export const exportSimpleCSV = (checkins: CheckinData[], event: EventData) => {
  const csvContent = [
    ['Nom', 'Prénom', 'Email', 'Téléphone', 'Entreprise', 'Date de check-in', 'Code de confirmation'],
    ...checkins.map(checkin => [
      checkin.guestInfo.lastName || '',
      checkin.guestInfo.firstName || '',
      checkin.guestInfo.email || '',
      checkin.guestInfo.phone || '',
      checkin.guestInfo.company || '',
      formatCheckinTime(checkin.checkedInAt),
      checkin.id
    ])
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  
  const eventName = event.name.replace(/[^a-zA-Z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `checkins_${eventName}_${date}.csv`);
  
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
