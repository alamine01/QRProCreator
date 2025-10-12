// Service d'envoi d'emails pour QR Pro Creator via EmailJS
import emailjs from '@emailjs/browser';

// Configuration EmailJS
const EMAILJS_SERVICE_ID = 'service_xwz0aqt'; // Votre Service ID Hostinger
const EMAILJS_TEMPLATE_ID_CONFIRMATION = 'template_lw6mpya'; // Template Order Confirmation
const EMAILJS_TEMPLATE_ID_STATUS = 'template_4kvu0dl'; // Template Contact Us (pour les mises à jour)
const EMAILJS_PUBLIC_KEY = 'TFj5gyJ_KcoCWQUmj'; // Votre Public Key EmailJS

// Configuration de l'expéditeur professionnel
const FROM_EMAIL = 'alamine@qrprocreator.com'; // Votre email professionnel Hostinger
const FROM_NAME = 'QR Pro Creator';
const REPLY_TO = 'alamine@qrprocreator.com';
const SUPPORT_EMAIL = 'alamine@qrprocreator.com';
const WHATSAPP_NUMBER = '+221 77 123 45 67';

// Interface pour les données de commande
interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Interface pour les données de mise à jour de statut
interface StatusUpdateEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
}

// Fonction pour envoyer un email de confirmation de commande via EmailJS
export const sendOrderConfirmationEmail = async (
  customerEmail: string, 
  orderNumber: string, 
  totalAmount: number,
  customerName: string,
  orderItems: Array<{name: string, quantity: number, price: number}>
): Promise<void> => {
  try {
    console.log('📧 Envoi de l\'email de confirmation via EmailJS...');
    
    // Préparer les données pour EmailJS
    const templateParams = {
      to_email: customerEmail,
      to_name: customerName,
      order_number: orderNumber,
      total_amount: totalAmount.toLocaleString(),
      items_list: orderItems.map(item => 
        `${item.name} (x${item.quantity}) - ${item.price.toLocaleString()} FCFA`
      ).join('\n'),
      company_name: FROM_NAME,
      support_email: SUPPORT_EMAIL,
      whatsapp_number: WHATSAPP_NUMBER,
      from_email: FROM_EMAIL,
      from_name: FROM_NAME,
      reply_to: REPLY_TO
    };

    console.log('📧 Paramètres EmailJS:', templateParams);
    console.log('📧 Email destinataire:', customerEmail);

    // Envoyer l'email via EmailJS
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_CONFIRMATION,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('✅ Email de confirmation envoyé avec succès:', result);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
    
    // En cas d'erreur, afficher un message à l'utilisateur mais ne pas bloquer le processus
    console.warn('⚠️ L\'email de confirmation n\'a pas pu être envoyé, mais la commande a été créée');
    
    // Ne pas throw l'erreur pour ne pas bloquer la création de commande
    // throw error;
  }
};

// Fonction pour envoyer un email de mise à jour de statut via EmailJS
export const sendOrderStatusUpdateEmail = async (
  customerEmail: string,
  orderNumber: string,
  status: 'pending' | 'processing' | 'delivered' | 'cancelled',
  customerName: string
): Promise<void> => {
  try {
    console.log('📧 Envoi de l\'email de mise à jour via EmailJS...');
    
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
    
    // Préparer les données pour EmailJS
    const templateParams = {
      to_email: customerEmail,
      to_name: customerName,
      order_number: orderNumber,
      status: status,
      status_message: statusMessages[status],
      status_icon: statusIcons[status],
      company_name: FROM_NAME,
      support_email: SUPPORT_EMAIL,
      whatsapp_number: WHATSAPP_NUMBER,
      from_email: FROM_EMAIL,
      from_name: FROM_NAME,
      reply_to: REPLY_TO
    };

    // Envoyer l'email via EmailJS
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_STATUS,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('✅ Email de mise à jour envoyé avec succès:', result);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de mise à jour:', error);
    
    // En cas d'erreur, afficher un message à l'utilisateur mais ne pas bloquer le processus
    console.warn('⚠️ L\'email de mise à jour n\'a pas pu être envoyé');
    
    // Ne pas throw l'erreur pour ne pas bloquer la mise à jour de statut
    // throw error;
  }
};

// Fonction pour initialiser EmailJS (à appeler au démarrage de l'app)
export const initializeEmailJS = () => {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation d\'EmailJS:', error);
  }
};
