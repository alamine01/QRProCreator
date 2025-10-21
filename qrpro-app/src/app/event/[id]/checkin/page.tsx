'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaHome,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Event, FormField } from '@/types/events';

interface CheckinPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CheckinPage({ params }: CheckinPageProps) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [checkinData, setCheckinData] = useState<any>(null);
  const [eventId, setEventId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/event/${eventId}/checkin`);
      const data = await response.json();
      
      if (data.success) {
        setEvent(data.data);
      } else {
        setErrors({ submit: data.error || 'Erreur lors du chargement de l\'événement' });
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setErrors({ submit: 'Erreur lors du chargement de l\'événement' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!event) return false;
    
    event.formConfig.fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} est requis`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/event/${eventId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setCheckinData(data.data);
      } else {
        setErrors({ submit: data.error || 'Erreur lors de l\'enregistrement' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: any) => {
    try {
      let dateObj;
      if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date(date);
      }
      
      return dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date non disponible';
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <FaEnvelope className="w-4 h-4" />;
      case 'phone':
        return <FaPhone className="w-4 h-4" />;
      case 'text':
        return <FaUser className="w-4 h-4" />;
      case 'textarea':
        return <FaBuilding className="w-4 h-4" />;
      case 'select':
        return <FaHome className="w-4 h-4" />;
      default:
        return <FaUser className="w-4 h-4" />;
    }
  };

  const renderField = (field: FormField) => {
    const hasError = errors[field.id];
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
              hasError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <select
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
              hasError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          >
            <option value="">{field.placeholder || 'Sélectionnez...'}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type={field.type === 'phone' ? 'tel' : field.type}
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
              hasError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A22] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'événement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Événement non trouvé</h3>
          <p className="mt-2 text-gray-600">Cet événement n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => window.close()}
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#F15A22] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Check-in réussi !</h2>
          <p className="text-gray-600 mb-6">
            Votre présence à l'événement <strong>{event.name}</strong> a été confirmée.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Code de confirmation</p>
            <p className="text-lg font-mono font-bold text-gray-900">{checkinData?.id}</p>
          </div>
          <button
            onClick={() => window.close()}
            className="w-full bg-[#F15A22] text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(to bottom right, ${event.formConfig.colors.background}, ${event.formConfig.colors.background}dd, ${event.formConfig.colors.background}aa)`
      }}
    >
      {/* Header Professionnel */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${event.formConfig.colors.primary} 0%, ${event.formConfig.colors.secondary} 100%)`,
          minHeight: '200px'
        }}
      >
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ backgroundColor: event.formConfig.colors.background }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
          {/* Logos */}
          <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Logo de la structure organisatrice */}
            {event.formConfig.logo && (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img 
                  src={event.formConfig.logo} 
                  alt="Logo de l'organisateur" 
                  className="h-12 w-auto sm:h-16 sm:w-auto rounded-lg shadow-lg bg-white p-1 sm:p-2"
                />
                <div className="text-white text-center sm:text-left">
                  <h2 className="text-sm sm:text-lg font-semibold">Organisateur</h2>
                  <p className="text-xs sm:text-sm opacity-80">Structure organisatrice</p>
                </div>
              </div>
            )}
            
            {/* Logo QRPRO */}
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-sm sm:text-lg font-bold" style={{ color: event.formConfig.colors.primary }}>QR</span>
              </div>
              <div className="text-white text-center sm:text-left">
                <h3 className="text-xs sm:text-sm font-semibold">QRPRO</h3>
                <p className="text-xs opacity-80">Check-in</p>
              </div>
            </div>
          </div>
          
          {/* Titre principal */}
          <div className="text-center text-white px-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 drop-shadow-lg">
              {event.name}
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-sm sm:text-base lg:text-lg opacity-90">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm lg:text-base">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm lg:text-base">{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
        {/* Message de bienvenue */}
        {event.formConfig.welcomeMessage && (
          <div 
            className="rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border text-center"
            style={{ 
              backgroundColor: event.formConfig.colors.background,
              borderColor: event.formConfig.colors.secondary + '20',
              color: event.formConfig.colors.text
            }}
          >
            <h2 
              className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2"
              style={{ color: event.formConfig.colors.text }}
            >
              {event.formConfig.welcomeMessage}
            </h2>
            {event.description && (
              <p 
                className="text-sm sm:text-base lg:text-lg opacity-80"
                style={{ color: event.formConfig.colors.text + '80' }}
              >
                {event.description}
              </p>
            )}
          </div>
        )}

        {/* Check-in Form */}
        <div 
          className="rounded-xl shadow-lg border"
          style={{ 
            backgroundColor: event.formConfig.colors.background,
            borderColor: event.formConfig.colors.secondary + '20'
          }}
        >
          <div 
            className="p-4 sm:p-6 border-b"
            style={{ borderColor: event.formConfig.colors.secondary + '20' }}
          >
            <h2 
              className="text-lg sm:text-xl font-semibold text-center"
              style={{ color: event.formConfig.colors.text }}
            >
              Formulaire de Check-in
            </h2>
            <p 
              className="text-center mt-2 text-sm sm:text-base"
              style={{ color: event.formConfig.colors.text + '80' }}
            >
              Veuillez remplir les informations ci-dessous
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {event.formConfig.fields.map((field) => (
                <div key={field.id}>
                  <label 
                    htmlFor={field.id} 
                    className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                    style={{ color: event.formConfig.colors.text }}
                  >
                    {field.label}
                    {field.required && (
                      <span 
                        className="ml-1"
                        style={{ color: event.formConfig.colors.primary }}
                      >
                        *
                      </span>
                    )}
                  </label>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                      <div 
                        className="p-1.5 sm:p-2 rounded-lg"
                        style={{ 
                          color: event.formConfig.colors.primary,
                          backgroundColor: event.formConfig.colors.primary + '10'
                        }}
                      >
                        {getFieldIcon(field.type)}
                      </div>
                    </div>
                    
                    <div className="pl-12 sm:pl-16">
                      {renderField(field)}
                    </div>
                  </div>
                  
                  {errors[field.id] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <FaExclamationTriangle className="w-3 h-3 mr-1" />
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <FaTimesCircle className="w-4 h-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="w-full text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{ 
                  background: `linear-gradient(135deg, ${event.formConfig.colors.primary} 0%, ${event.formConfig.colors.secondary} 100%)`,
                  color: 'white'
                }}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="w-5 h-5 mr-3 animate-spin" />
                    Enregistrement en cours...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5 mr-3" />
                    Confirmer ma présence
                  </>
                )}
              </button>
              
              <p 
                className="text-center mt-4 text-sm"
                style={{ color: event.formConfig.colors.text + '60' }}
              >
                En cliquant sur "Confirmer ma présence", vous acceptez de participer à cet événement.
              </p>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer Professionnel */}
      <footer 
        className="mt-16 py-8"
        style={{ 
          backgroundColor: event.formConfig.colors.background,
          borderTop: `1px solid ${event.formConfig.colors.secondary}20`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-6 mb-4">
            {/* Logo de l'organisateur */}
            {event.formConfig.logo && (
              <div className="flex items-center space-x-2">
                <img 
                  src={event.formConfig.logo} 
                  alt="Logo de l'organisateur" 
                  className="h-8 w-auto"
                />
                <div>
                  <h3 
                    className="text-sm font-semibold"
                    style={{ color: event.formConfig.colors.text }}
                  >
                    Organisateur
                  </h3>
                </div>
              </div>
            )}
            
            {/* Séparateur */}
            <div className="w-px h-8 bg-gray-300"></div>
            
            {/* Logo QRPRO */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded flex items-center justify-center" style={{ backgroundColor: event.formConfig.colors.primary }}>
                <span className="text-xs font-bold text-white">QR</span>
              </div>
              <div>
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: event.formConfig.colors.text }}
                >
                  QRPRO
                </h3>
                <p 
                  className="text-xs"
                  style={{ color: event.formConfig.colors.text + '60' }}
                >
                  Système de Check-in
                </p>
              </div>
            </div>
          </div>
          
          <p 
            className="text-sm"
            style={{ color: event.formConfig.colors.text + '60' }}
          >
            © 2024 QRPRO. Tous droits réservés. | 
            <span className="ml-2">Powered by QRPRO Technology</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
