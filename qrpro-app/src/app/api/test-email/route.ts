import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [TEST API] Début du test d\'envoi d\'email');
    
    const { customerEmail, orderNumber, status, customerName } = await request.json();
    
    console.log('🧪 [TEST API] Données reçues:', {
      customerEmail,
      orderNumber,
      status,
      customerName
    });
    
    // Test de l'envoi d'email selon le statut
    if (status === 'pending') {
      // Test de confirmation de commande
      await sendOrderConfirmationEmail(
        customerEmail,
        orderNumber,
        50000, // Montant de test
        customerName,
        [{ name: 'Produit test', quantity: 1, price: 50000 }]
      );
    } else {
      // Test de changement de statut
      await sendOrderStatusUpdateEmail(
        customerEmail,
        orderNumber,
        status,
        customerName
      );
    }
    
    console.log('✅ [TEST API] Email de test envoyé avec succès');
    
    return NextResponse.json({
      success: true,
      message: 'Email de test envoyé avec succès',
      data: {
        customerEmail,
        orderNumber,
        status,
        customerName
      }
    });
    
  } catch (error) {
    console.error('❌ [TEST API] Erreur lors du test d\'envoi d\'email:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: {
        errorType: typeof error,
        errorStack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}
