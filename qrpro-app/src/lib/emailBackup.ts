// Service email de secours utilisant l'API du serveur
// Ce service sera utilisé si EmailJS échoue

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export const sendEmailBackup = async (emailData: EmailData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 [EMAIL BACKUP] Tentative d\'envoi via service de secours:', {
      to: emailData.to,
      subject: emailData.subject
    });

    // Utiliser l'API de votre serveur pour envoyer l'email
    const response = await fetch('/api/send-email-backup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ [EMAIL BACKUP] Email envoyé avec succès via service de secours');
      return { success: true };
    } else {
      const error = await response.json();
      console.error('❌ [EMAIL BACKUP] Erreur du service de secours:', error);
      return { success: false, error: error.message || 'Erreur inconnue' };
    }

  } catch (error) {
    console.error('❌ [EMAIL BACKUP] Erreur lors de l\'envoi via service de secours:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
};

// Fonction pour envoyer un email de confirmation via le service de secours
export const sendOrderConfirmationEmailBackup = async (
  customerEmail: string,
  orderNumber: string,
  totalAmount: number,
  customerName: string,
  orderItems: Array<{name: string, quantity: number, price: number}>
): Promise<void> => {
  try {
    console.log('📧 [EMAIL BACKUP] Envoi de confirmation via service de secours');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F15A22;">Confirmation de commande</h2>
        <p>Bonjour ${customerName},</p>
        <p>Votre commande <strong>#${orderNumber}</strong> a été confirmée avec succès.</p>
        
        <h3>Détails de la commande :</h3>
        <ul>
          ${orderItems.map(item => 
            `<li>${item.name} x${item.quantity} - ${item.price.toLocaleString()} FCFA</li>`
          ).join('')}
        </ul>
        
        <p><strong>Total : ${totalAmount.toLocaleString()} FCFA</strong></p>
        
        <p>Merci pour votre confiance !</p>
        <p>L'équipe QR Pro Creator</p>
      </div>
    `;

    const text = `
      Confirmation de commande
      
      Bonjour ${customerName},
      
      Votre commande #${orderNumber} a été confirmée avec succès.
      
      Détails de la commande :
      ${orderItems.map(item => 
        `- ${item.name} x${item.quantity} - ${item.price.toLocaleString()} FCFA`
      ).join('\n')}
      
      Total : ${totalAmount.toLocaleString()} FCFA
      
      Merci pour votre confiance !
      L'équipe QR Pro Creator
    `;

    await sendEmailBackup({
      to: customerEmail,
      subject: `Confirmation de commande #${orderNumber}`,
      html,
      text
    });

  } catch (error) {
    console.error('❌ [EMAIL BACKUP] Erreur lors de l\'envoi de confirmation:', error);
  }
};

// Fonction pour envoyer un email de changement de statut via le service de secours
export const sendOrderStatusUpdateEmailBackup = async (
  customerEmail: string,
  orderNumber: string,
  status: 'pending' | 'processing' | 'delivered' | 'cancelled',
  customerName: string
): Promise<void> => {
  try {
    console.log('📧 [EMAIL BACKUP] Envoi de changement de statut via service de secours');

    const statusMessages = {
      pending: 'Votre commande est en attente de traitement',
      processing: 'Votre commande est en cours de traitement',
      delivered: 'Votre commande a été livrée avec succès',
      cancelled: 'Votre commande a été annulée'
    };

    const statusIcons = {
      pending: '⏳',
      processing: '🔄',
      delivered: '✅',
      cancelled: '❌'
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F15A22;">Mise à jour de commande</h2>
        <p>Bonjour ${customerName},</p>
        <p>${statusIcons[status]} ${statusMessages[status]}</p>
        <p>Commande : <strong>#${orderNumber}</strong></p>
        <p>Statut : <strong>${status}</strong></p>
        <p>Merci pour votre confiance !</p>
        <p>L'équipe QR Pro Creator</p>
      </div>
    `;

    const text = `
      Mise à jour de commande
      
      Bonjour ${customerName},
      
      ${statusIcons[status]} ${statusMessages[status]}
      
      Commande : #${orderNumber}
      Statut : ${status}
      
      Merci pour votre confiance !
      L'équipe QR Pro Creator
    `;

    await sendEmailBackup({
      to: customerEmail,
      subject: `Mise à jour de commande #${orderNumber}`,
      html,
      text
    });

  } catch (error) {
    console.error('❌ [EMAIL BACKUP] Erreur lors de l\'envoi de changement de statut:', error);
  }
};

