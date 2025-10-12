'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { uploadProfilePicture } from '@/lib/firebase';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  MessageSquare,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Save,
  Upload,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';

export default function EditProfile() {
  const router = useRouter();
  const { user, loading, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profession: '',
    phone: '',
    phoneSecondary: '',
    phoneThird: '',
    phoneFourth: '',
    address: '',
    location: '',
    reviewLink: '',
    biography: '',
    linkedin: '',
    whatsapp: '',
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    snapchat: ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [phoneCount, setPhoneCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profession: user.profession || '',
        phone: user.phone || '',
        phoneSecondary: user.phoneSecondary || '',
        phoneThird: user.phoneThird || '',
        phoneFourth: user.phoneFourth || '',
        address: user.address || '',
        location: user.location || '',
        reviewLink: user.reviewLink || '',
        biography: user.biography || '',
        linkedin: user.linkedin || '',
        whatsapp: user.whatsapp || '',
        instagram: user.instagram || '',
        twitter: user.twitter || '',
        facebook: user.facebook || '',
        youtube: user.youtube || '',
        tiktok: user.tiktok || '',
        snapchat: user.snapchat || ''
      });
      
      if (user.profilePicture) {
        setProfilePicturePreview(user.profilePicture);
      }

      // Count existing phone numbers
      const phones = [user.phone, user.phoneSecondary, user.phoneThird, user.phoneFourth].filter(Boolean);
      setPhoneCount(phones.length || 1);
    }
  }, [user, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const addPhoneField = () => {
    if (phoneCount < 4) {
      setPhoneCount(phoneCount + 1);
    }
  };

  const removePhoneField = (index: number) => {
    if (phoneCount > 1) {
      const phoneFields = ['phone', 'phoneSecondary', 'phoneThird', 'phoneFourth'];
      const fieldToRemove = phoneFields[index];
      setFormData(prev => ({
        ...prev,
        [fieldToRemove]: ''
      }));
      setPhoneCount(phoneCount - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let profilePictureUrl = user?.profilePicture; // Garder l'URL existante par défaut

      // Upload de la nouvelle image si un fichier a été sélectionné
      if (profilePictureFile) {
        setUploadingImage(true);
        console.log('Upload de la nouvelle image de profil...');
        profilePictureUrl = await uploadProfilePicture(user?.id || '', profilePictureFile);
        console.log('Image uploadée avec succès:', profilePictureUrl);
        setUploadingImage(false);
      }

      // Préparer les données à sauvegarder
      const userDataToSave = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        profession: formData.profession,
        phone: formData.phone,
        phoneSecondary: formData.phoneSecondary,
        phoneThird: formData.phoneThird,
        phoneFourth: formData.phoneFourth,
        address: formData.address,
        location: formData.location,
        reviewLink: formData.reviewLink,
        biography: formData.biography,
        linkedin: formData.linkedin,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        twitter: formData.twitter,
        facebook: formData.facebook,
        youtube: formData.youtube,
        tiktok: formData.tiktok,
        snapchat: formData.snapchat,
        profilePicture: profilePictureUrl, // Inclure l'URL de l'image
      };

      // Sauvegarder les données
      await updateUser(userDataToSave);
      
      console.log('Profil mis à jour avec succès');
      
      // Rediriger vers le dashboard après sauvegarde
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-8">
            Vous devez être connecté pour modifier votre profil.
          </p>
          <a
            href="/auth/signin"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Return Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Modifier votre profil</h1>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 space-y-6 border border-white/20">
          {/* Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Photo de profil</label>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Upload className="h-5 w-5 mr-2 text-gray-400" />
                Télécharger une photo
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom de famille</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-gray-700">Profession ou titre</label>
              <input 
                type="text" 
                id="profession" 
                name="profession" 
                value={formData.profession}
                onChange={handleInputChange}
                placeholder="ex: Ingénieur logiciel, Responsable marketing"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Phone Numbers Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Numéros de téléphone</h3>
            <div className="space-y-4">
              {/* Primary Phone */}
              <div className="flex items-center space-x-2">
                <div className="flex-grow">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Numéro de téléphone principal
                  </label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Entrez votre numéro de téléphone principal"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Secondary Phone */}
              {phoneCount >= 2 && (
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <label htmlFor="phoneSecondary" className="block text-sm font-medium text-gray-700">
                      Numéro de téléphone secondaire
                    </label>
                    <input 
                      type="tel" 
                      id="phoneSecondary" 
                      name="phoneSecondary" 
                      value={formData.phoneSecondary}
                      onChange={handleInputChange}
                      placeholder="Entrez votre numéro de téléphone secondaire"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removePhoneField(1)}
                    className="mt-6 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Third Phone */}
              {phoneCount >= 3 && (
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <label htmlFor="phoneThird" className="block text-sm font-medium text-gray-700">
                      Troisième numéro de téléphone
                    </label>
                    <input 
                      type="tel" 
                      id="phoneThird" 
                      name="phoneThird" 
                      value={formData.phoneThird}
                      onChange={handleInputChange}
                      placeholder="Entrez votre troisième numéro de téléphone"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removePhoneField(2)}
                    className="mt-6 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Fourth Phone */}
              {phoneCount >= 4 && (
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <label htmlFor="phoneFourth" className="block text-sm font-medium text-gray-700">
                      Quatrième numéro de téléphone
                    </label>
                    <input 
                      type="tel" 
                      id="phoneFourth" 
                      name="phoneFourth" 
                      value={formData.phoneFourth}
                      onChange={handleInputChange}
                      placeholder="Entrez votre quatrième numéro de téléphone"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removePhoneField(3)}
                    className="mt-6 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Add Phone Button */}
            {phoneCount < 4 && (
              <button 
                type="button" 
                onClick={addPhoneField}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un autre numéro de téléphone
              </button>
            )}
          </div>

          {/* Location Section */}
          <div className="space-y-1">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
            <input 
              type="text" 
              name="address" 
              id="address" 
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Entrez votre adresse"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lien de localisation (Google Maps)</label>
            <input 
              type="text" 
              id="location" 
              name="location" 
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Entrez le lien Google Maps"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Review Link Section */}
          <div>
            <label htmlFor="reviewLink" className="block text-sm font-medium text-gray-700">Lien d'avis</label>
            <input 
              type="text" 
              id="reviewLink" 
              name="reviewLink" 
              value={formData.reviewLink}
              onChange={handleInputChange}
              placeholder="Ajoutez un lien pour les avis"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Biography */}
          <div>
            <label htmlFor="biography" className="block text-sm font-medium text-gray-700">Biographie courte</label>
            <textarea 
              id="biography" 
              name="biography" 
              rows={4} 
              placeholder="Parlez-nous un peu de vous..." 
              value={formData.biography}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Liens des réseaux sociaux</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </div>
                </label>
                <input 
                  type="text" 
                  id="whatsapp" 
                  name="whatsapp" 
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Numéro WhatsApp ou lien"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Instagram */}
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                    Instagram
                  </div>
                </label>
                <input 
                  type="text" 
                  id="instagram" 
                  name="instagram" 
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="Nom d'utilisateur Instagram ou lien de profil"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                    LinkedIn
                  </div>
                </label>
                <input 
                  type="text" 
                  id="linkedin" 
                  name="linkedin" 
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="Lien de profil LinkedIn"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Facebook */}
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                    Facebook
                  </div>
                </label>
                <input 
                  type="text" 
                  id="facebook" 
                  name="facebook" 
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="Lien de profil Facebook"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Twitter */}
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                    Twitter
                  </div>
                </label>
                <input 
                  type="text" 
                  id="twitter" 
                  name="twitter" 
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="Nom d'utilisateur Twitter ou lien de profil"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* YouTube */}
              <div>
                <label htmlFor="youtube" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <Youtube className="h-4 w-4 mr-2 text-red-600" />
                    YouTube
                  </div>
                </label>
                <input 
                  type="text" 
                  id="youtube" 
                  name="youtube" 
                  value={formData.youtube}
                  onChange={handleInputChange}
                  placeholder="Lien de chaîne YouTube"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* TikTok */}
              <div>
                <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                    TikTok
                  </div>
                </label>
                <input 
                  type="text" 
                  id="tiktok" 
                  name="tiktok" 
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  placeholder="Nom d'utilisateur TikTok ou lien de profil"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Snapchat */}
              <div>
                <label htmlFor="snapchat" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                    Snapchat
                  </div>
                </label>
                <input 
                  type="text" 
                  id="snapchat" 
                  name="snapchat" 
                  value={formData.snapchat}
                  onChange={handleInputChange}
                  placeholder="Nom d'utilisateur Snapchat"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between pt-6 space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {uploadingImage ? 'Upload de l\'image...' : 'Enregistrement...'}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
