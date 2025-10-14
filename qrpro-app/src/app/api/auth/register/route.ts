import { NextRequest, NextResponse } from 'next/server';
import { createUserWithPassword } from '@/lib/userAuth';
import { RegisterFormData } from '@/types';
import { validateEmail, validatePasswordStrength } from '@/lib/auth';

// POST - Inscription avec email/password
export async function POST(request: NextRequest) {
  try {
    const body: RegisterFormData = await request.json();
    const { firstName, lastName, email, password, confirmPassword } = body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(' ') },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }

    const result = await createUserWithPassword(body);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        user: {
          id: result.user!.id,
          email: result.user!.email,
          firstName: result.user!.firstName,
          lastName: result.user!.lastName,
          profileSlug: result.user!.profileSlug,
          isAdmin: result.user!.isAdmin,
          mustChangePassword: result.user!.mustChangePassword,
          accountType: result.user!.accountType
        }
      });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
