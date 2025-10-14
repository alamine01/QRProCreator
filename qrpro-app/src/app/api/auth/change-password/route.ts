import { NextRequest, NextResponse } from 'next/server';
import { updateUserPassword } from '@/lib/userAuth';
import { validatePasswordStrength } from '@/lib/auth';

// POST - Changer le mot de passe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation du nouveau mot de passe
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(' ') },
        { status: 400 }
      );
    }

    const updateResult = await updateUserPassword(userId, currentPassword, newPassword);

    if (updateResult.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: updateResult.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur lors du changement de mot de passe' },
      { status: 500 }
    );
  }
}
