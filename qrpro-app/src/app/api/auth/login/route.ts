import { NextRequest, NextResponse } from 'next/server';
import { verifyUserCredentials } from '@/lib/userAuth';

// POST - Connexion avec email/password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }

    const result = await verifyUserCredentials(email, password);

    if (result.success && result.user) {
      // Ici, vous pourriez créer un token de session ou un cookie
      return NextResponse.json({ 
        success: true, 
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          profileSlug: result.user.profileSlug,
          isAdmin: result.user.isAdmin,
          mustChangePassword: result.user.mustChangePassword,
          accountType: result.user.accountType
        }
      });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
