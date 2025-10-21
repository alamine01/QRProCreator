'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt,
  FaUsers, 
  FaQrcode,
  FaDownload,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye
} from 'react-icons/fa';
import { Event, EventCheckin, EventStats } from '@/types/events';
import EventStatsComponent from '@/components/events/EventStatsComponent';
import { exportStyledExcel, exportSimpleCSV } from '@/lib/excelExport';
import { formatFirebaseDate } from '@/lib/dateUtils';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [checkins, setCheckins] = useState<EventCheckin[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [eventId, setEventId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Fermer le menu d'export quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.export-menu-container')) {
          setShowExportMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }
    
    if (user && eventId) {
      fetchEventData();
    }
  }, [user, loading, router, eventId]);

  const fetchEventData = async () => {
    try {
      setLoadingData(true);
      
      const [eventResponse, checkinsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/events/${eventId}`),
        fetch(`/api/admin/events/${eventId}/checkins`),
        fetch(`/api/admin/events/${eventId}/stats`)
      ]);
      
      const [eventData, checkinsData, statsData] = await Promise.all([
        eventResponse.json(),
        checkinsResponse.json(),
        statsResponse.json()
      ]);
      
      if (eventData.success) {
        setEvent(eventData.data);
      }
      
      if (checkinsData.success) {
        setCheckins(checkinsData.data.checkins || []);
      }
      
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredCheckins = checkins.filter(checkin => 
    checkin.guestInfo.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.guestInfo.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.guestInfo.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.guestInfo.phone?.includes(searchTerm)
  );

  const paginatedCheckins = filteredCheckins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCheckins.length / itemsPerPage);

  const formatCheckinTime = (timestamp: any) => {
    try {
      if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Date invalide';
    } catch (error) {
      return 'Date invalide';
    }
  };

  const exportStyledExcelFile = () => {
    if (!event) {
      alert('Événement non trouvé');
      return;
    }

    if (!checkins.length) {
      alert(`Aucune donnée de présence à exporter pour l'événement "${event.name}".\n\nPour tester l'export, vous devez d'abord avoir des check-ins enregistrés via la page de check-in publique.`);
      return;
    }

    try {
      exportStyledExcel(checkins as any, event, {
        organizerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : undefined,
        organizerEmail: user?.email,
        organizerPhone: user?.phone
      });
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      alert('Erreur lors de l\'export Excel. Veuillez réessayer.');
    }
    setShowExportMenu(false);
  };

  const exportCSVFile = () => {
    if (!event) {
      alert('Événement non trouvé');
      return;
    }

    if (!checkins.length) {
      alert(`Aucune donnée de présence à exporter pour l'événement "${event.name}".\n\nPour tester l'export, vous devez d'abord avoir des check-ins enregistrés via la page de check-in publique.`);
      return;
    }

    try {
      exportSimpleCSV(checkins as any, event);
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      alert('Erreur lors de l\'export CSV. Veuillez réessayer.');
    }
    setShowExportMenu(false);
  };

  const canUserAccess = () => {
    if (!event || !firebaseUser) return false;
    return event.ownerId === firebaseUser.uid || event.collaborators.includes(firebaseUser.uid);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A22] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!event || !canUserAccess()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Accès refusé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n'avez pas accès à cet événement.
          </p>
          <button
            onClick={() => router.push('/dashboard/events')}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/events')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {event.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {event.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <div className="relative export-menu-container">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm sm:text-base lg:text-lg font-medium"
                >
                  <FaDownload className="mr-2 text-sm sm:text-base lg:text-lg" />
                  Exporter
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={exportStyledExcelFile}
                        className="w-full px-4 py-3 text-left text-sm sm:text-base text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FaDownload className="mr-3 text-green-600 text-sm sm:text-base" />
                        Excel stylisé (.xls)
                      </button>
                      <button
                        onClick={exportCSVFile}
                        className="w-full px-4 py-3 text-left text-sm sm:text-base text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FaDownload className="mr-3 text-blue-600 text-sm sm:text-base" />
                        CSV simple (.csv)
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push(`/event/${event.id}/checkin`)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-xl hover:opacity-90 transition-all duration-300 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                <FaQrcode className="mr-2 sm:mr-3 text-base sm:text-lg lg:text-xl" />
                <span className="hidden sm:inline">Page de check-in</span>
                <span className="sm:hidden">Check-in</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-3 text-[#F15A22]" />
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="text-lg font-semibold text-gray-900">{formatFirebaseDate(event.date)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-3 text-[#F15A22]" />
              <div>
                <p className="text-sm font-medium text-gray-500">Lieu</p>
                <p className="text-lg font-semibold text-gray-900">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaUsers className="mr-3 text-[#F15A22]" />
              <div>
                <p className="text-sm font-medium text-gray-500">Collaborateurs</p>
                <p className="text-lg font-semibold text-gray-900">{event.collaborators.length}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-3 text-[#F15A22]" />
              <div>
                <p className="text-sm font-medium text-gray-500">Créé le</p>
                <p className="text-lg font-semibold text-gray-900">{formatFirebaseDate(event.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <FaCheckCircle className="mr-3 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total check-ins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCheckins}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <FaClock className="mr-3 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Heure de pointe</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.peakHour}h</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <FaUsers className="mr-3 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Moyenne/heure</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageCheckinsPerHour)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <FaEye className="mr-3 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {event.isActive ? 'Actif' : 'Inactif'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques en temps réel */}
        <EventStatsComponent eventId={eventId} className="mb-8" />

        {/* Check-ins List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">Liste des check-ins</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCheckins.map((checkin) => (
                  <tr key={checkin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {checkin.guestInfo.firstName} {checkin.guestInfo.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{checkin.guestInfo.phone}</div>
                      {checkin.guestInfo.email && (
                        <div className="text-sm text-gray-500">{checkin.guestInfo.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{checkin.guestInfo.company || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCheckinTime(checkin.checkedInAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedCheckins.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun check-in</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Aucun check-in ne correspond à votre recherche.'
                  : 'Aucun invité n\'a encore effectué de check-in.'
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredCheckins.length)} sur {filteredCheckins.length} résultats
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
