// Composant de débogage pour vérifier le statut admin
'use client';

import { useAuth } from '@/contexts/AuthContext';

export function AdminDebugInfo() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="font-bold mb-2">Informations de Débogage Admin</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Utilisateur connecté:</strong> {user ? 'Oui' : 'Non'}</p>
        {user && (
          <>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Nom:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>isAdmin:</strong> {user.isAdmin ? '✅ Oui' : '❌ Non'}</p>
            <p><strong>Statut admin détecté:</strong> {isAdmin ? '✅ Oui' : '❌ Non'}</p>
          </>
        )}
      </div>
    </div>
  );
}
