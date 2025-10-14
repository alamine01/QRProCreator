'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/layout/AdminNavigation';
import { generateQRCode } from '@/lib/qrcode';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaMap,
  FaInstagram,
  FaWhatsapp,
  FaTwitter,
  FaSnapchat,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaUser,
  FaBuilding,
  FaGlobe,
  FaImage,
  FaUpload
} from 'react-icons/fa';
import { BusinessCard } from '@/types';

export default function BusinessCardsManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<BusinessCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<BusinessCard | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessCard>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [lastUpdatedCardId, setLastUpdatedCardId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/auth/signin');
      return;
    }

    if (user?.isAdmin) {
      fetchBusinessCards();
    }
  }, [user, loading, router]);

  useEffect(() => {
    const filtered = businessCards.filter(card =>
      (card.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [businessCards, searchTerm]);

  const fetchBusinessCards = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement des cartes de visite...');
      
      // Ajouter un paramètre de cache busting
      const timestamp = Date.now();
      const response = await fetch(`/api/admin/business-cards?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cartes chargées:', data.length, 'cartes');
        
        // Nettoyer les URLs blob invalides
        const cleanedData = data.map((card: any) => {
          if (card.photoPath && card.photoPath.startsWith('blob:')) {
            return { ...card, photoPath: '' };
          }
          return card;
        });
        
        setBusinessCards(cleanedData);
      } else {
        console.error('❌ Erreur HTTP:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setFormData({
      name: '',
      title: '',
      company: '',
      bio: '',
      website: '',
      phonePrimary: '',
      phoneSecondary: '',
      email: '',
        location: '',
        address: '',
        mapsLink: '',
        photoPath: '',
      qrCodePath: '',
      isActive: true,
      instagram: '',
      whatsapp: '',
      twitter: '',
      snapchat: '',
      facebook: '',
      linkedin: '',
      youtube: '',
      tiktok: ''
    });
    setShowModal(true);
  };

  const handleEditCard = (card: BusinessCard) => {
    setEditingCard(card);
    setFormData(card);
    setSelectedPhotoFile(null); // Reset photo file
    setShowModal(true);
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      setIsUploadingPhoto(true);
      console.log('📸 Upload de la photo:', file.name);
      
      // Initialiser Firebase Storage
      const storage = getStorage();
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile_${timestamp}_${randomString}.${fileExtension}`;

      // Upload vers Firebase Storage
      const storageRef = ref(storage, `profile-photos/${fileName}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      console.log('✅ Photo uploadée:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de la photo:', error);
      alert('Erreur lors de l\'upload de la photo');
      throw error;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Fonction pour supprimer l'ancienne image
  const deleteOldPhoto = async (photoUrl: string) => {
    try {
      if (photoUrl && photoUrl.startsWith('https://firebasestorage.googleapis.com/')) {
        const storage = getStorage();
        // Extraire le chemin du fichier depuis l'URL
        const urlParts = photoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1].split('?')[0];
        const filePath = `profile-photos/${fileName}`;
        
        const oldPhotoRef = ref(storage, filePath);
        await deleteObject(oldPhotoRef);
        console.log('🗑️ Ancienne photo supprimée:', filePath);
      }
    } catch (error) {
      console.log('⚠️ Impossible de supprimer l\'ancienne photo:', error);
      // Ne pas bloquer le processus si la suppression échoue
    }
  };

  const handleSaveCard = async () => {
    if (!formData.name || !formData.title || !formData.email || !formData.phonePrimary) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier si l'email existe déjà (validation côté client)
    const emailExists = businessCards.some(card => 
      card.email && 
      (card.email || '').toLowerCase() === (formData.email || '').toLowerCase() && 
      card.id !== editingCard?.id
    );

    if (emailExists) {
      alert('Une carte avec cet email existe déjà. Veuillez utiliser un email différent.');
      return;
    }

    try {
      setIsSaving(true);
      
      // Si une photo a été sélectionnée mais pas encore uploadée, uploader maintenant
      let finalFormData = { ...formData };
      if (selectedPhotoFile && formData.photoPath?.startsWith('blob:')) {
        console.log('📸 Upload de la photo avant sauvegarde...');
        
        // Supprimer l'ancienne photo si elle existe
        if (editingCard && editingCard.photoPath && editingCard.photoPath.startsWith('https://firebasestorage.googleapis.com/')) {
          console.log('🗑️ Suppression de l\'ancienne photo...');
          await deleteOldPhoto(editingCard.photoPath);
        }
        
        try {
          const photoUrl = await handlePhotoUpload(selectedPhotoFile);
          finalFormData.photoPath = photoUrl;
          console.log('✅ Photo uploadée et intégrée:', photoUrl);
        } catch (error) {
          console.error('❌ Erreur upload photo:', error);
          alert('Erreur lors de l\'upload de la photo. Veuillez réessayer.');
          return;
        }
      } else if (formData.photoPath?.startsWith('blob:')) {
        console.log('⚠️ URL blob détectée mais pas de fichier sélectionné');
        // Supprimer l'URL blob invalide
        finalFormData.photoPath = '';
      }
      
      const url = editingCard 
        ? `/api/admin/business-cards/${editingCard.id}` 
        : '/api/admin/business-cards';
      const method = editingCard ? 'PUT' : 'POST';

      console.log('💾 Sauvegarde de la carte:', finalFormData);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalFormData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Carte sauvegardée:', result);
        
        // Mise à jour locale immédiate
        if (editingCard) {
          // Mise à jour d'une carte existante
          setBusinessCards(prev => 
            prev.map(card => card.id === editingCard.id ? result : card)
          );
          console.log('🔄 Carte mise à jour localement');
          setLastUpdatedCardId(editingCard.id);
        } else {
          // Création d'une nouvelle carte
          setBusinessCards(prev => [result, ...prev]);
          console.log('🔄 Nouvelle carte ajoutée localement');
          setLastUpdatedCardId(result.id);
        }
        
        // Fermer le modal et réinitialiser le formulaire
        setShowModal(false);
        setFormData({});
        setEditingCard(null);
        setSelectedPhotoFile(null);
        
        // Message de succès
        alert(editingCard ? 'Carte mise à jour avec succès!' : 'Carte créée avec succès!');
      } else {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        
        // Afficher l'erreur spécifique
        if (response.status === 400) {
          alert(`Erreur: ${errorData.error}`);
        } else {
          alert(`Erreur: ${errorData.error || 'Impossible de sauvegarder la carte'}`);
        }
      }
    } catch (error) {
      console.error('Error saving business card:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte de visite ?')) {
      return;
    }

    try {
      // Trouver la carte à supprimer pour récupérer l'URL de la photo
      const cardToDelete = businessCards.find(card => card.id === id);
      
      // Supprimer la photo de profil si elle existe
      if (cardToDelete && cardToDelete.photoPath && cardToDelete.photoPath.startsWith('https://firebasestorage.googleapis.com/')) {
        console.log('🗑️ Suppression de la photo de profil...');
        await deleteOldPhoto(cardToDelete.photoPath);
      }

      const response = await fetch(`/api/admin/business-cards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Mise à jour locale immédiate
        setBusinessCards(prev => prev.filter(card => card.id !== id));
        console.log('🗑️ Carte supprimée localement');
        
        alert('Carte supprimée avec succès!');
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error deleting business card:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#F15A22] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminNavigation />
      
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Gestion des Cartes de Visite
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Créez et gérez les cartes de visite de l'entreprise
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateCard}
              className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
            >
              <FaPlus className="mr-2" />
              Nouvelle Carte
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
            />
          </div>
        </div>

        {/* Business Cards Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A22] mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des cartes...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEdit className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucune carte trouvée' : 'Aucune carte de visite'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Essayez de modifier votre recherche'
                : 'Commencez par créer votre première carte de visite'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateCard}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-lg hover:opacity-90 transition-opacity mx-auto"
              >
                <FaPlus className="mr-2" />
                Créer une Carte
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <div key={card.id} className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 ${
                lastUpdatedCardId === card.id ? 'ring-2 ring-green-400 bg-green-50' : ''
              }`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {card.photoPath ? (
                        <img
                          src={card.photoPath}
                          alt={card.name || 'Photo de profil'}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            console.error('❌ Erreur chargement image:', card.photoPath);
                            console.error('❌ Carte:', card.name || 'Sans nom', card.id);
                          }}
                          onLoad={() => {
                            console.log('✅ Image chargée:', card.photoPath);
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-lg">
                            {(card.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <h3 className="font-bold text-gray-900">{card.name || 'Sans nom'}</h3>
                        <p className="text-sm text-gray-500">{card.title || 'Sans titre'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {card.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        {card.email}
                      </div>
                    )}
                    {card.phonePrimary && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaPhone className="mr-2 text-gray-400" />
                        {card.phonePrimary}
                      </div>
                    )}
                    {card.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {card.location}
                      </div>
                    )}
                    {card.mapsLink && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMap className="mr-2 text-gray-400" />
                        <a 
                          href={card.mapsLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Voir sur Maps
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      card.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {card.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => {
                        // Ouvrir le profil public de la carte de visite dans un nouvel onglet
                        const publicUrl = `/business-card/${card.uniqueId || card.id}`;
                        window.open(publicUrl, '_blank');
                      }}
                      className="text-[#F15A22] hover:text-[#F15A22]/80 text-sm font-medium"
                    >
                      Voir le profil public
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Formulaire Simple */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCard ? 'Modifier la Carte' : 'Nouvelle Carte de Visite'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Informations Personnelles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUser className="mr-2 text-[#F15A22]" />
                    Informations Personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                        placeholder="Ex: Jean Dupont"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre/Poste *
                      </label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                        placeholder="Ex: Directeur Marketing"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        value={formData.company || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                        placeholder="Ex: Mon Entreprise SARL"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Web
                      </label>
                      <input
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                        placeholder="https://www.monentreprise.com"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biographie
                    </label>
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                      rows={3}
                      placeholder="Parlez de vous, de votre expertise..."
                    />
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaPhone className="mr-2 text-blue-500" />
                    Contact & Localisation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone Principal *
                      </label>
                      <input
                        type="tel"
                        value={formData.phonePrimary || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, phonePrimary: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                        placeholder="+221 77 123 45 67"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone Secondaire
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneSecondary || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneSecondary: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                        placeholder="+221 33 987 65 43"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent ${
                          formData.email && businessCards.some(card => 
                            card.email && 
                            (card.email || '').toLowerCase() === (formData.email || '').toLowerCase() && 
                            card.id !== editingCard?.id
                          ) ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="jean.dupont@entreprise.com"
                        required
                      />
                      {formData.email && businessCards.some(card => 
                        card.email && 
                        (card.email || '').toLowerCase() === (formData.email || '').toLowerCase() && 
                        card.id !== editingCard?.id
                      ) && (
                        <p className="text-red-500 text-sm mt-1">
                          ⚠️ Une carte avec cet email existe déjà
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville/Région *
                      </label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                        placeholder="Ex: Dakar, Sénégal"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien Google Maps
                      </label>
                      <input
                        type="url"
                        value={formData.mapsLink || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, mapsLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                        placeholder="https://maps.google.com/..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Copiez le lien "Partager" depuis Google Maps pour permettre la navigation
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse complète
                    </label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                      rows={2}
                      placeholder="Rue, quartier, bâtiment..."
                    />
                  </div>
                </div>

                {/* Réseaux Sociaux */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaInstagram className="mr-2 text-pink-500" />
                    Réseaux Sociaux
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'instagram', icon: FaInstagram, color: 'text-pink-500' },
                      { key: 'whatsapp', icon: FaWhatsapp, color: 'text-green-500' },
                      { key: 'facebook', icon: FaFacebook, color: 'text-blue-600' },
                      { key: 'twitter', icon: FaTwitter, color: 'text-blue-400' },
                      { key: 'linkedin', icon: FaLinkedin, color: 'text-blue-700' },
                      { key: 'youtube', icon: FaYoutube, color: 'text-red-500' },
                      { key: 'snapchat', icon: FaSnapchat, color: 'text-yellow-500' },
                      { key: 'tiktok', icon: FaTiktok, color: 'text-black' }
                    ].map(({ key, icon: Icon, color }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Icon className={`inline mr-2 ${color}`} />
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <input
                          type="url"
                          value={String(formData[key as keyof BusinessCard] || '')}
                          onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                          placeholder={`https://${key}.com/votre-profil`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photo */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaImage className="mr-2 text-purple-500" />
                    Photo de Profil
                  </h3>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#F15A22] hover:text-[#F15A22]/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#F15A22]">
                          <span>Télécharger une photo</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Vérifier la taille du fichier (10MB max)
                                const maxSize = 10 * 1024 * 1024; // 10MB en bytes
                                if (file.size > maxSize) {
                                  alert('Le fichier est trop volumineux. Taille maximale autorisée: 10MB');
                                  return;
                                }

                                // Vérifier le type de fichier
                                if (!file.type.startsWith('image/')) {
                                  alert('Veuillez sélectionner un fichier image valide');
                                  return;
                                }

                                setSelectedPhotoFile(file);
                                
                                // Afficher un aperçu local immédiatement
                                setFormData(prev => ({ ...prev, photoPath: URL.createObjectURL(file) }));
                                
                                // L'upload vers Firebase Storage se fera au moment de la sauvegarde
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                      {isUploadingPhoto && (
                        <div className="mt-2 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F15A22]"></div>
                          <span className="ml-2 text-xs text-gray-500">Upload en cours...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {formData.photoPath && (
                    <div className="mt-4 text-center">
                      <img
                        src={formData.photoPath}
                        alt="Aperçu"
                        className="mx-auto h-24 w-24 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveCard}
                disabled={isSaving}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <FaSave className="mr-2" />
                {isSaving ? 'Sauvegarde...' : (editingCard ? 'Mettre à jour' : 'Créer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}