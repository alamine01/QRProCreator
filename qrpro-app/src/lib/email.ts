// Service d'envoi d'emails pour QR Pro Creator via EmailJS
import { sendOrderConfirmationEmail as sendConfirmationEmailJS, sendOrderStatusUpdateEmail as sendStatusUpdateEmailJS } from './emailjs';

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
    
    // Utiliser EmailJS pour envoyer l'email
    await sendConfirmationEmailJS(customerEmail, orderNumber, totalAmount, customerName, orderItems);
    
    console.log('✅ Email de confirmation envoyé avec succès');
    
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
    
    // Utiliser EmailJS pour envoyer l'email
    await sendStatusUpdateEmailJS(customerEmail, orderNumber, status, customerName);
    
    console.log('✅ Email de mise à jour envoyé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de mise à jour:', error);
    
    // En cas d'erreur, afficher un message à l'utilisateur mais ne pas bloquer le processus
    console.warn('⚠️ L\'email de mise à jour n\'a pas pu être envoyé');
    
    // Ne pas throw l'erreur pour ne pas bloquer la mise à jour de statut
    // throw error;
  }
};
