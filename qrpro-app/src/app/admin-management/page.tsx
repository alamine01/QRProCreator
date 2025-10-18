'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: any;
  profileSlug: string;
}

interface Diagnosis {
  totalUsers: number;
  adminUsers: User[];
  regularUsers: User[];
  users: User[];
}

export default function AdminManagementPage() {
  const { user } = useAuth();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [promoteEmail, setPromoteEmail] = useState('');

  const loadDiagnosis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/diagnose-users');
      const data = await response.json();
      
      if (response.ok) {
        setDiagnosis(data);
        setMessage(`✅ Diagnostic chargé: ${data.totalUsers} utilisateurs trouvés`);
      } else {
        setMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const promoteUserByEmail = async () => {
    if (!promoteEmail) {
      setMessage('Veuillez entrer un email');
      return;
    }

    try {
      setLoading(true);
      setMessage('Promotion en cours...');

      const response = await fetch('/api/admin/promote-by-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: promoteEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.user.firstName} ${data.user.lastName} a été promu administrateur !`);
        setPromoteEmail('');
        // Recharger le diagnostic
        await loadDiagnosis();
      } else {
        setMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnosis();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Gestion des Administrateurs
          </h1>
          
          {/* Utilisateur actuel */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Votre compte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Nom:</strong> {user.firstName} {user.lastName}
                </div>
                <div>
                  <strong>Statut Admin:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isAdmin ? '✅ Administrateur' : '❌ Utilisateur'}
                  </span>
                </div>
                <div>
                  <strong>ID:</strong> {user.id}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Diagnostic */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Diagnostic</h3>
              <button
                onClick={loadDiagnosis}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Chargement...' : 'Charger le diagnostic'}
              </button>
            </div>

            {/* Promotion */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Promouvoir un utilisateur</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  placeholder="Email de l'utilisateur à promouvoir"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={promoteUserByEmail}
                  disabled={loading || !promoteEmail}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {loading ? 'Promotion...' : 'Promouvoir en Admin'}
                </button>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 
              message.includes('❌') ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {message}
            </div>
          )}

          {/* Résultats du diagnostic */}
          {diagnosis && (
            <div className="space-y-6">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">{diagnosis.totalUsers}</div>
                  <div className="text-sm text-blue-700">Total utilisateurs</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">{diagnosis.adminUsers.length}</div>
                  <div className="text-sm text-green-700">Administrateurs</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{diagnosis.regularUsers.length}</div>
                  <div className="text-sm text-gray-700">Utilisateurs</div>
                </div>
              </div>

              {/* Liste des utilisateurs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tous les utilisateurs</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {diagnosis.users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{user.firstName} {user.lastName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.isAdmin ? 'Admin' : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{user.profileSlug}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 text-center">
            <a 
              href="/admin" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            >
              Aller à l'interface admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
