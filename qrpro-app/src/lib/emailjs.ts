import emailjs from '@emailjs/browser';

// Configuration EmailJS
const EMAILJS_SERVICE_ID = 'service_xwz0aqt'; // Votre Service ID Hostinger
const EMAILJS_TEMPLATE_ID_CONFIRMATION = 'template_lw6mpya'; // Template Order Confirmation
const EMAILJS_TEMPLATE_ID_STATUS = 'template_4kvu0dl'; // Template Contact Us (pour les mises à jour)
const EMAILJS_PUBLIC_KEY = 'TFj5gyJ_KcoCWQUmj'; // Votre Public Key EmailJS

// Option pour désactiver temporairement l'envoi d'email (pour debug)
const EMAIL_ENABLED = true; // Réactivé - EmailJS fonctionne

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
    console.log('🚀 [EMAILJS] === DÉBUT ENVOI CONFIRMATION ===');
    console.log('📧 [EMAILJS] Version du code:', 'v2.1 - Template original avec améliorations');
    console.log('📧 [EMAILJS] Template utilisé:', EMAILJS_TEMPLATE_ID_STATUS);
    console.log('📧 [EMAILJS] Timestamp:', new Date().toISOString());
    console.log('📧 Envoi de l\'email de confirmation via EmailJS...');
    
    // Vérifier si l'envoi d'email est activé
    if (!EMAIL_ENABLED) {
      console.warn('⚠️ Envoi d\'email désactivé (mode debug)');
      return;
    }
    
    // Vérifier les paramètres requis
    if (!customerEmail || !orderNumber || !customerName) {
      console.error('❌ Paramètres manquants pour l\'envoi d\'email');
      return;
    }
    
    
    // Vérifier la configuration EmailJS
    console.log('📧 Vérification de la configuration EmailJS:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID_CONFIRMATION, // Template de confirmation original
      publicKey: EMAILJS_PUBLIC_KEY.substring(0, 8) + '...',
      emailEnabled: EMAIL_ENABLED
    });
    
    // Préparer les données pour EmailJS (template professionnel avec détails structurés)
    const templateParams = {
      to_email: customerEmail,
      to_name: customerName,
      order_number: orderNumber,
      total_amount: totalAmount.toLocaleString(),
      items_list: orderItems.map(item => 
        `${item.name} (x${item.quantity}) - ${item.price.toLocaleString()} FCFA`
      ).join('\n'),
      company_name: FROM_NAME,
      support_email: 'alamine@qrprocreator.com',
      whatsapp_number: '+221 77 123 45 67',
      from_email: FROM_EMAIL,
      from_name: FROM_NAME,
      reply_to: REPLY_TO,
      // Paramètres pour le template professionnel
      greeting_message: `Bonjour ${customerName},`,
      confirmation_text: `Nous avons bien reçu votre commande ${orderNumber} et nous vous en remercions !`,
      order_details_title: '📦 Détails de votre commande :',
      next_steps_title: '🚀 Prochaines étapes :',
      next_steps_list: `• Votre commande est en cours de traitement
• Nous vous tiendrons informé de son avancement par email
• Livraison prévue sous 3-5 jours ouvrés`,
      contact_text: 'Pour toute question concernant votre commande, n\'hésitez pas à nous contacter.',
      signature: `Cordialement,
L'équipe ${FROM_NAME}`,
      // Ajout d'informations pour améliorer la délivrabilité
      unsubscribe_text: 'Si vous ne souhaitez plus recevoir nos emails, vous pouvez nous contacter.',
      company_address: 'Dakar, Sénégal',
      email_reason: 'Email de confirmation de commande'
    };

    console.log('📧 Paramètres EmailJS:', templateParams);
    console.log('📧 Email destinataire:', customerEmail);

    // Envoyer l'email via EmailJS avec gestion d'erreur spécifique
    try {
      // Essayer d'abord avec le template de confirmation
      let result;
      try {
        console.log('📧 [EMAILJS] Envoi de confirmation en cours vers:', customerEmail);
        
        // Ajouter un petit délai pour éviter le spam
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Utiliser le template de statut qui fonctionne pour la confirmation
        result = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID_STATUS, // Template qui fonctionne
          templateParams,
          EMAILJS_PUBLIC_KEY
        );
        console.log('✅ [EMAILJS] Email de confirmation envoyé avec succès:', {
          email: customerEmail,
          result: result,
          status: result.status,
          text: result.text
        });
      } catch (templateError) {
        console.warn('⚠️ Erreur avec le template de confirmation, essai avec le template de statut:', templateError);
        
        // Essayer avec le template de statut comme fallback
        const fallbackParams = {
          to_email: customerEmail,
          to_name: customerName,
          order_number: orderNumber,
          status: 'confirmed',
          status_message: 'Votre commande a été confirmée avec succès',
          status_icon: '✅',
          company_name: FROM_NAME,
          support_email: SUPPORT_EMAIL,
          whatsapp_number: WHATSAPP_NUMBER,
          from_email: FROM_EMAIL,
          from_name: FROM_NAME,
          reply_to: REPLY_TO
        };
        
        result = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID_STATUS,
          fallbackParams,
          EMAILJS_PUBLIC_KEY
        );
        console.log('✅ Email envoyé avec le template de statut (fallback)');
      }
      
      console.log('✅ Email de confirmation envoyé avec succès:', result);
      
      // Vérifier si le résultat indique un succès
      if (result && result.status === 200) {
        console.log('✅ Email envoyé avec succès (status 200)');
      } else {
        console.warn('⚠️ Email envoyé mais status non-standard:', result);
      }
      
    } catch (emailError) {
      // Capturer spécifiquement les erreurs d'EmailJS
      console.error('❌ Erreur spécifique EmailJS:', emailError);
      throw emailError; // Re-lancer pour être capturé par le catch principal
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
    
    // Analyser le type d'erreur
    let errorMessage = 'Erreur inconnue';
    let errorCode = 'UNKNOWN';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Gérer les erreurs d'EmailJS qui peuvent être des objets
      if ('text' in error) {
        errorMessage = (error as any).text || 'Erreur EmailJS';
      } else if ('message' in error) {
        errorMessage = (error as any).message;
      } else if ('status' in error) {
        errorCode = `HTTP_${(error as any).status}`;
        errorMessage = `Erreur HTTP ${(error as any).status}`;
      }
    }
    
    console.error('❌ Détails de l\'erreur:', {
      errorType: typeof error,
      errorMessage,
      errorCode,
      errorObject: error,
      customerEmail,
      orderNumber,
      totalAmount,
      emailjsConfig: {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID_CONFIRMATION,
        publicKey: EMAILJS_PUBLIC_KEY.substring(0, 8) + '...'
      }
    });
    
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
    console.log('📧 [EMAILJS] Envoi de l\'email de mise à jour via EmailJS...');
    console.log('📧 [EMAILJS] Paramètres reçus:', {
      customerEmail,
      orderNumber,
      status,
      customerName,
      timestamp: new Date().toISOString()
    });
    
    // Vérifier si l'envoi d'email est activé
    if (!EMAIL_ENABLED) {
      console.warn('⚠️ [EMAILJS] Envoi d\'email désactivé (mode debug)');
      return;
    }
    
    // Vérifier les paramètres requis
    if (!customerEmail || !orderNumber || !customerName || !status) {
      console.error('❌ [EMAILJS] Paramètres manquants pour l\'envoi d\'email:', {
        customerEmail: !!customerEmail,
        orderNumber: !!orderNumber,
        customerName: !!customerName,
        status: !!status
      });
      return;
    }
    
    
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

    console.log('📧 [EMAILJS] Paramètres EmailJS préparés:', templateParams);
    console.log('📧 [EMAILJS] Configuration EmailJS:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID_STATUS,
      publicKey: EMAILJS_PUBLIC_KEY.substring(0, 8) + '...'
    });

    // Envoyer l'email via EmailJS
    console.log('📧 [EMAILJS] Envoi en cours vers:', customerEmail);
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_STATUS,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('✅ [EMAILJS] Email de mise à jour envoyé avec succès:', {
      email: customerEmail,
      result: result,
      status: result.status,
      text: result.text
    });
    
  } catch (error) {
    console.error('❌ [EMAILJS] Erreur lors de l\'envoi de l\'email de mise à jour:', error);
    
    // Analyser le type d'erreur
    let errorMessage = 'Erreur inconnue';
    let errorCode = 'UNKNOWN';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Gérer les erreurs d'EmailJS qui peuvent être des objets
      if ('text' in error) {
        errorMessage = (error as any).text || 'Erreur EmailJS';
      } else if ('message' in error) {
        errorMessage = (error as any).message;
      } else if ('status' in error) {
        errorCode = `HTTP_${(error as any).status}`;
        errorMessage = `Erreur HTTP ${(error as any).status}`;
      }
    }
    
    console.error('❌ [EMAILJS] Détails de l\'erreur:', {
      errorType: typeof error,
      errorMessage,
      errorCode,
      errorObject: error,
      customerEmail,
      orderNumber,
      status,
      customerName,
      emailjsConfig: {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID_STATUS,
        publicKey: EMAILJS_PUBLIC_KEY.substring(0, 8) + '...'
      }
    });
    
    // En cas d'erreur, afficher un message à l'utilisateur mais ne pas bloquer le processus
    console.warn('⚠️ [EMAILJS] L\'email de mise à jour n\'a pas pu être envoyé');
    
    // Ne pas throw l'erreur pour ne pas bloquer la mise à jour de statut
    // throw error;
  }
};

// Fonction pour initialiser EmailJS (à appeler au démarrage de l'app)
export const initializeEmailJS = () => {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS initialisé avec succès');
    console.log('📧 Configuration EmailJS:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateIdConfirmation: EMAILJS_TEMPLATE_ID_CONFIRMATION,
      templateIdStatus: EMAILJS_TEMPLATE_ID_STATUS,
      publicKey: EMAILJS_PUBLIC_KEY.substring(0, 8) + '...' // Masquer la clé pour la sécurité
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation d\'EmailJS:', error);
    console.error('❌ Détails de l\'erreur d\'initialisation:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

// Fonction pour tester la configuration EmailJS
export const testEmailJSConfiguration = async (): Promise<boolean> => {
  try {
    console.log('🧪 Test de la configuration EmailJS...');
    
    // Vérifier que EmailJS est disponible
    if (!emailjs || typeof emailjs.send !== 'function') {
      console.error('❌ EmailJS n\'est pas disponible');
      return false;
    }
    
    // Vérifier la configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID_CONFIRMATION || !EMAILJS_PUBLIC_KEY) {
      console.error('❌ Configuration EmailJS incomplète');
      return false;
    }
    
    console.log('✅ Configuration EmailJS valide');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de configuration EmailJS:', error);
    return false;
  }
};
