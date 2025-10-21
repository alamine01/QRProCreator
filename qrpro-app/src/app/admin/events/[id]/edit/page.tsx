'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaTimes, FaPlus, FaTrash, FaPalette, FaUser, FaInfoCircle } from 'react-icons/fa';
import { Event, UpdateEventData, FormField, EventColors } from '@/types/events';
import { formatFirebaseDate } from '@/lib/dateUtils';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { user, firebaseUser, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventId, setEventId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [collaboratorSearchTerm, setCollaboratorSearchTerm] = useState('');
  const [showCollaboratorDropdown, setShowCollaboratorDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    type: 'with_preregistration' as 'with_preregistration' | 'without_preregistration',
    isActive: true,
    collaborators: [] as string[],
    formConfig: {
      fields: [] as FormField[],
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        background: '#F8FAFC',
        text: '#1F2937'
      } as EventColors,
      logo: '',
      welcomeMessage: 'Bienvenue à notre événement !'
    }
  });

  // Filtrer les utilisateurs disponibles pour les collaborateurs
  const availableCollaborators = users.filter(user => 
    !formData.collaborators.includes(user.id) && 
    user.id !== event?.ownerId
  );

  const filteredCollaborators = availableCollaborators.filter(user => {
    const searchLower = collaboratorSearchTerm.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = user.email.toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/auth/signin');
      return;
    }
    
    if (firebaseUser && eventId) {
      fetchEvent();
      fetchUsers();
    }
  }, [firebaseUser, loading, router, eventId]);

  // Fermer le dropdown des collaborateurs quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCollaboratorDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.collaborator-search-container')) {
          setShowCollaboratorDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCollaboratorDropdown]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        console.error('Erreur lors de la récupération des utilisateurs:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchEvent = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`/api/admin/events/${eventId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('fetchEvent: Données reçues:', data.data);
        console.log('fetchEvent: Type de date:', typeof data.data.date);
        console.log('fetchEvent: Valeur de date:', data.data.date);
        console.log('fetchEvent: Date de création:', data.data.createdAt);
        console.log('fetchEvent: Type de createdAt:', typeof data.data.createdAt);
        
        setEvent(data.data);
        
        // Gérer la conversion de la date selon son format
        let eventDate = '';
        if (data.data.date) {
          try {
            let dateObj;
            
            if (typeof data.data.date === 'string') {
              // Si c'est déjà une string au format ISO, extraire juste la date
              if (data.data.date.includes('T')) {
                eventDate = data.data.date.split('T')[0];
              } else {
                dateObj = new Date(data.data.date);
              }
            } else if (data.data.date.toDate && typeof data.data.date.toDate === 'function') {
              // Timestamp Firebase
              dateObj = data.data.date.toDate();
            } else if (data.data.date instanceof Date) {
              // Date JavaScript
              dateObj = data.data.date;
            } else {
              // Fallback: essayer de créer une date
              dateObj = new Date(data.data.date);
            }
            
            // Si on a un objet Date, le convertir
            if (dateObj && !isNaN(dateObj.getTime())) {
              eventDate = dateObj.toISOString().split('T')[0];
            }
            
            console.log('Date finale:', eventDate);
          } catch (error) {
            console.error('Erreur lors de la conversion de la date:', error);
            console.log('Valeur de date problématique:', data.data.date);
            // Utiliser la date d'aujourd'hui comme fallback
            eventDate = new Date().toISOString().split('T')[0];
          }
        }
        
        setFormData({
          name: data.data.name,
          description: data.data.description,
          date: eventDate,
          location: data.data.location,
          type: data.data.type,
          isActive: data.data.isActive,
          collaborators: data.data.collaborators || [],
          formConfig: {
            fields: data.data.formConfig?.fields || [],
            colors: data.data.formConfig?.colors || {
              primary: '#3B82F6',
              secondary: '#1E40AF',
              background: '#F8FAFC',
              text: '#1F2937'
            },
            logo: data.data.formConfig?.logo || '',
            welcomeMessage: data.data.formConfig?.welcomeMessage || 'Bienvenue à notre événement !'
          }
        });
      } else {
        alert('Erreur lors du chargement de l\'événement');
        router.push('/admin/events');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Erreur lors du chargement de l\'événement');
    } finally {
      setLoadingData(false);
    }
  };

  const addFormField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      placeholder: ''
    };
    
    setFormData({
      ...formData,
      formConfig: {
        ...formData.formConfig,
        fields: [...formData.formConfig.fields, newField]
      }
    });
  };

  const removeFormField = (fieldId: string) => {
    setFormData({
      ...formData,
      formConfig: {
        ...formData.formConfig,
        fields: formData.formConfig.fields.filter(field => field.id !== fieldId)
      }
    });
  };

  const updateFormField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData({
      ...formData,
      formConfig: {
        ...formData.formConfig,
        fields: formData.formConfig.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      }
    });
  };

  const addCollaborator = (userId: string) => {
    if (!formData.collaborators.includes(userId)) {
      setFormData(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, userId]
      }));
    }
  };

  const removeCollaborator = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(id => id !== userId)
    }));
  };

  const selectCollaborator = (user: User) => {
    addCollaborator(user.id);
    setCollaboratorSearchTerm('');
    setShowCollaboratorDropdown(false);
  };

  const clearCollaboratorSearch = () => {
    setCollaboratorSearchTerm('');
    setShowCollaboratorDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firebaseUser?.uid) {
      alert('Erreur: Vous devez être connecté');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: UpdateEventData = {
        name: formData.name,
        description: formData.description,
        date: new Date(formData.date),
        location: formData.location,
        type: formData.type,
        isActive: formData.isActive,
        collaborators: formData.collaborators,
        formConfig: formData.formConfig
      };

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Événement modifié avec succès !');
        router.push('/admin/events');
      } else {
        alert('Erreur lors de la modification: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de l\'événement');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A22] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Événement non trouvé</h3>
          <button
            onClick={() => router.push('/admin/events')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#F15A22] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux événements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/events')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Modifier l'événement
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {event.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations de base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'événement *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de l'événement *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  required
                />
              </div>

              {/* Lieu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'événement *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'with_preregistration' | 'without_preregistration' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  required
                >
                  <option value="with_preregistration">Avec pré-inscription</option>
                  <option value="without_preregistration">Sans pré-inscription</option>
                </select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              {/* Collaborateurs - Seulement pour les admins */}
              {isAdmin && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    Collaborateurs
                  </label>
                
                {/* Liste des collaborateurs actuels */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Collaborateurs actuels :</h4>
                  {formData.collaborators.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucun collaborateur assigné</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.collaborators.map(collaboratorId => {
                        const user = users.find(u => u.id === collaboratorId);
                        return (
                          <div key={collaboratorId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm">
                              {user ? `${user.firstName || ''} ${user.lastName || ''} (${user.email})` : `ID: ${collaboratorId}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeCollaborator(collaboratorId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Ajouter un collaborateur avec recherche */}
                <div className="relative collaborator-search-container">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Ajouter un collaborateur :</h4>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={collaboratorSearchTerm}
                      onChange={(e) => {
                        setCollaboratorSearchTerm(e.target.value);
                        setShowCollaboratorDropdown(true);
                      }}
                      onFocus={() => setShowCollaboratorDropdown(true)}
                      placeholder={loadingUsers ? 'Chargement des utilisateurs...' : 'Rechercher un utilisateur...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                      disabled={loadingUsers}
                    />
                    
                    {collaboratorSearchTerm && (
                      <button
                        type="button"
                        onClick={clearCollaboratorSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown des collaborateurs */}
                  {showCollaboratorDropdown && !loadingUsers && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCollaborators.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          {collaboratorSearchTerm ? 'Aucun utilisateur trouvé' : 'Commencez à taper pour rechercher'}
                        </div>
                      ) : (
                        filteredCollaborators.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => selectCollaborator(user)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}`
                                    : 'Utilisateur'
                                  }
                                </div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                              {user.isAdmin && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Admin
                                </span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  
                  <p className="mt-1 text-sm text-gray-500">
                    Les collaborateurs peuvent voir les détails de l'événement mais ne peuvent pas le modifier
                  </p>
                </div>
                </div>
              )}

              {/* Note pour les propriétaires non-admins */}
              {!isAdmin && (
                <div className="col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FaInfoCircle className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Gestion des collaborateurs</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Seuls les administrateurs peuvent assigner des collaborateurs à cet événement. 
                          Contactez un administrateur si vous souhaitez ajouter des collaborateurs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date de création (lecture seule) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de création
                </label>
                <input
                  type="text"
                  value={formatFirebaseDate(event?.createdAt)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Configuration du formulaire */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuration du formulaire de check-in</h2>
            
            {/* Message de bienvenue */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de bienvenue
              </label>
              <input
                type="text"
                value={formData.formConfig.welcomeMessage}
                onChange={(e) => setFormData({
                  ...formData,
                  formConfig: { ...formData.formConfig, welcomeMessage: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                placeholder="Bienvenue à notre événement !"
              />
            </div>

            {/* Logo de l'organisateur */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de l'organisateur
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="url"
                  value={formData.formConfig.logo}
                  onChange={(e) => setFormData({
                    ...formData,
                    formConfig: { ...formData.formConfig, logo: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  placeholder="https://exemple.com/logo.png"
                />
                {formData.formConfig.logo && (
                  <img 
                    src={formData.formConfig.logo} 
                    alt="Aperçu du logo" 
                    className="h-12 w-auto rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                URL de l'image du logo de votre structure
              </p>
            </div>

            {/* Champs du formulaire */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-900">Champs du formulaire</h3>
                <button
                  type="button"
                  onClick={addFormField}
                  className="inline-flex items-center px-3 py-2 bg-[#F15A22] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <FaPlus className="mr-2" />
                  Ajouter un champ
                </button>
              </div>

              <div className="space-y-4">
                {formData.formConfig.fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                          placeholder="Ex: Prénom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateFormField(field.id, { type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                        >
                          <option value="text">Texte</option>
                          <option value="email">Email</option>
                          <option value="phone">Téléphone</option>
                          <option value="textarea">Zone de texte</option>
                          <option value="select">Sélection</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                          placeholder="Ex: Votre prénom"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Requis</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeFormField(field.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Personnalisation des couleurs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FaPalette className="mr-2" />
              Personnalisation des couleurs
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur principale
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.formConfig.colors.primary}
                    onChange={(e) => setFormData({
                      ...formData,
                      formConfig: {
                        ...formData.formConfig,
                        colors: { ...formData.formConfig.colors, primary: e.target.value }
                      }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.formConfig.colors.primary}
                    onChange={(e) => setFormData({
                      ...formData,
                      formConfig: {
                        ...formData.formConfig,
                        colors: { ...formData.formConfig.colors, primary: e.target.value }
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur secondaire
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.formConfig.colors.secondary}
                    onChange={(e) => setFormData({
                      ...formData,
                      formConfig: {
                        ...formData.formConfig,
                        colors: { ...formData.formConfig.colors, secondary: e.target.value }
                      }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.formConfig.colors.secondary}
                    onChange={(e) => setFormData({
                      ...formData,
                      formConfig: {
                        ...formData.formConfig,
                        colors: { ...formData.formConfig.colors, secondary: e.target.value }
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur de fond
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.formConfig.colors.background}
                    onChange={(e) => setFormData({
                      ...formData,
                      formConfig: {
                        ...formData.formConfig,
                        colors: { ...formData.formConfig.colors, background: e.target.value }
                      }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.formConfig.colors.background}
                    onChange={(e) => setFormData({
                      ...formData,
                      formConfig: {
                        ...formData.formConfig,
                        colors: { ...formData.formConfig.colors, background: e.target.value }
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur du texte
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.formConfig.colors.text}
                    onChange={(e) => setFormData({
                      ...formData,
                      formConfig: {
                        ...formData.formConfig,
                        colors: { ...formData.formConfig.colors, text: e.target.value }
                      }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.formConfig.colors.text}
                    onChange={(e) => setFormData({
                      ...formData,
                      formConfig: {
                        ...formData.formConfig,
                        colors: { ...formData.formConfig.colors, text: e.target.value }
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Aperçu des couleurs */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Aperçu des couleurs</h3>
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: formData.formConfig.colors.background,
                  color: formData.formConfig.colors.text 
                }}
              >
                <div 
                  className="inline-block px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: formData.formConfig.colors.primary }}
                >
                  Bouton principal
                </div>
                <div 
                  className="inline-block px-4 py-2 rounded-lg text-white font-medium ml-2"
                  style={{ backgroundColor: formData.formConfig.colors.secondary }}
                >
                  Bouton secondaire
                </div>
                <p className="mt-2 text-sm">
                  Ces couleurs seront appliquées sur la page de check-in
                </p>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-6">
            <button
              type="button"
              onClick={() => router.push('/admin/events')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base lg:text-lg font-medium"
            >
              <FaTimes className="mr-2 text-sm sm:text-base lg:text-lg" />
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 bg-[#F15A22] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm sm:text-base lg:text-lg font-medium"
            >
              <FaSave className="mr-2 text-sm sm:text-base lg:text-lg" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
