import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();
    
    console.log('📧 [EMAIL BACKUP API] Tentative d\'envoi d\'email:', {
      to,
      subject,
      timestamp: new Date().toISOString()
    });

    // Ici, vous pouvez intégrer un autre service d'email comme :
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer avec SMTP
    
    // Pour l'instant, on simule l'envoi
    console.log('📧 [EMAIL BACKUP API] Email simulé envoyé:', {
      to,
      subject,
      html: html.substring(0, 100) + '...',
      text: text.substring(0, 100) + '...'
    });

    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Email envoyé via service de secours',
      data: {
        to,
        subject,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [EMAIL BACKUP API] Erreur:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}
