'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaPalette, FaUser } from 'react-icons/fa';
import { EventFormConfig, FormField, EventColors } from '@/types/events';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
  loading?: boolean;
}

export default function EventFormModal({ isOpen, onClose, onSubmit, loading = false }: EventFormModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    type: 'with_preregistration' as 'with_preregistration' | 'without_preregistration',
    ownerId: '',
    collaborators: [] as string[],
    formConfig: {
      fields: [
        {
          id: 'firstName',
          label: 'Prénom',
          type: 'text' as const,
          required: true,
          placeholder: 'Votre prénom'
        },
        {
          id: 'lastName',
          label: 'Nom',
          type: 'text' as const,
          required: true,
          placeholder: 'Votre nom'
        },
        {
          id: 'phone',
          label: 'Téléphone',
          type: 'phone' as const,
          required: true,
          placeholder: 'Votre numéro de téléphone'
        },
        {
          id: 'email',
          label: 'Email',
          type: 'email' as const,
          required: false,
          placeholder: 'Votre adresse email'
        }
      ] as FormField[],
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

  const [showColorPicker, setShowColorPicker] = useState(false);

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUsers = users.filter(user => {
    const searchLower = userSearchTerm.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = user.email.toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Récupérer les utilisateurs au chargement du modal
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-search-container')) {
          setShowUserDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.date || !formData.location || !formData.ownerId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onSubmit(formData);
  };

  const selectUser = (user: User) => {
    setFormData(prev => ({ ...prev, ownerId: user.id }));
    setUserSearchTerm(`${user.firstName || ''} ${user.lastName || ''} (${user.email})`.trim());
    setShowUserDropdown(false);
  };

  const clearUserSelection = () => {
    setFormData(prev => ({ ...prev, ownerId: '' }));
    setUserSearchTerm('');
    setShowUserDropdown(false);
  };

  const addFormField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: 'Nouveau champ',
      type: 'text',
      required: false,
      placeholder: 'Placeholder'
    };
    
    setFormData(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        fields: [...prev.formConfig.fields, newField]
      }
    }));
  };

  const removeFormField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        fields: prev.formConfig.fields.filter(field => field.id !== fieldId)
      }
    }));
  };

  const updateFormField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        fields: prev.formConfig.fields.map(field => 
          field.id === fieldId ? { ...field, ...updates } : field
        )
      }
    }));
  };

  const updateColors = (colorType: keyof EventColors, value: string) => {
    setFormData(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        colors: {
          ...prev.formConfig.colors,
          [colorType]: value
        }
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Créer un événement</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'événement *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                placeholder="Ex: Conférence Tech 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'événement *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
              >
                <option value="with_preregistration">Avec pré-inscription</option>
                <option value="without_preregistration">Sans pré-inscription</option>
              </select>
            </div>
          </div>

          {/* Sélection du propriétaire avec recherche */}
          <div className="relative user-search-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Propriétaire de l'événement *
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  setShowUserDropdown(true);
                }}
                onFocus={() => setShowUserDropdown(true)}
                placeholder={loadingUsers ? 'Chargement des utilisateurs...' : 'Rechercher un utilisateur...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                disabled={loadingUsers}
                required
              />
              
              {formData.ownerId && (
                <button
                  type="button"
                  onClick={clearUserSelection}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown des utilisateurs */}
            {showUserDropdown && !loadingUsers && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {userSearchTerm ? 'Aucun utilisateur trouvé' : 'Commencez à taper pour rechercher'}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectUser(user)}
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
              Le propriétaire pourra gérer et modifier cet événement
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
              rows={3}
              placeholder="Décrivez votre événement..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure *
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                placeholder="Ex: Centre de conférences, Paris"
                required
              />
            </div>
          </div>

          {/* Configuration du formulaire */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration du formulaire de check-in</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de bienvenue
              </label>
              <input
                type="text"
                value={formData.formConfig.welcomeMessage}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  formConfig: { ...prev.formConfig, welcomeMessage: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                placeholder="Message affiché aux invités"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo (URL)
              </label>
              <input
                type="url"
                value={formData.formConfig.logo}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  formConfig: { ...prev.formConfig, logo: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                placeholder="https://exemple.com/logo.png"
              />
            </div>

            {/* Champs du formulaire */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Champs du formulaire
                </label>
                <button
                  type="button"
                  onClick={addFormField}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <FaPlus className="mr-1" />
                  Ajouter un champ
                </button>
              </div>

              <div className="space-y-3">
                {formData.formConfig.fields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Label"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateFormField(field.id, { type: e.target.value as any })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="text">Texte</option>
                        <option value="email">Email</option>
                        <option value="phone">Téléphone</option>
                        <option value="textarea">Zone de texte</option>
                        <option value="select">Sélection</option>
                      </select>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Placeholder"
                      />
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                            className="mr-1"
                          />
                          Requis
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFormField(field.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Couleurs */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Couleurs du thème
                </label>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <FaPalette className="mr-1" />
                  Personnaliser
                </button>
              </div>

              {showColorPicker && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Couleur principale</label>
                    <input
                      type="color"
                      value={formData.formConfig.colors.primary}
                      onChange={(e) => updateColors('primary', e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Couleur secondaire</label>
                    <input
                      type="color"
                      value={formData.formConfig.colors.secondary}
                      onChange={(e) => updateColors('secondary', e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Arrière-plan</label>
                    <input
                      type="color"
                      value={formData.formConfig.colors.background}
                      onChange={(e) => updateColors('background', e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Texte</label>
                    <input
                      type="color"
                      value={formData.formConfig.colors.text}
                      onChange={(e) => updateColors('text', e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base lg:text-lg font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm sm:text-base lg:text-lg font-medium"
            >
              {loading ? 'Création...' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
