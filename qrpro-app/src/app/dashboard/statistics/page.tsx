'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStats, StatsData } from '@/lib/firebase';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Smartphone, 
  Download,
  Calendar,
  ArrowLeft,
  Eye
} from 'lucide-react';

export default function StatisticsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'scans' | 'downloads'>('overview');

  // Charger les vraies données depuis Firebase - SÉCURISÉ
  useEffect(() => {
    const loadStats = async () => {
      if (user && user.id) {
        try {
          setIsLoading(true);
          // Passer l'ID de l'utilisateur connecté pour la vérification de sécurité
          const stats = await getUserStats(user.id, user.id, selectedPeriod);
          setStatsData(stats);
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
          // En cas d'erreur, afficher des données par défaut
          setStatsData({
            totalScans: 0,
            uniqueScans: 0,
            scansToday: 0,
            scansThisWeek: 0,
            scansThisMonth: 0,
            topCountries: [],
            topDevices: [],
            hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
            recentScans: [],
            // Nouvelles statistiques pour les téléchargements vCard
            totalVCardDownloads: 0,
            uniqueVCardDownloads: 0,
            vCardDownloadsToday: 0,
            vCardDownloadsThisWeek: 0,
            vCardDownloadsThisMonth: 0,
            recentVCardDownloads: []
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadStats();
  }, [user, selectedPeriod]);

  const handleExportData = () => {
    if (!statsData) return;
    
    // Créer un fichier CSV avec les données
    const csvData = [
      ['Statistique', 'Valeur'],
      ['Total des scans', statsData.totalScans.toString()],
      ['Scans uniques', statsData.uniqueScans.toString()],
      ['Scans aujourd\'hui', statsData.scansToday.toString()],
      ['Scans cette semaine', statsData.scansThisWeek.toString()],
      ['Scans ce mois', statsData.scansThisMonth.toString()],
      [''],
      ['Téléchargements vCard', 'Valeur'],
      ['Total téléchargements', statsData.totalVCardDownloads.toString()],
      ['Téléchargements uniques', statsData.uniqueVCardDownloads.toString()],
      ['Téléchargements aujourd\'hui', statsData.vCardDownloadsToday.toString()],
      ['Téléchargements cette semaine', statsData.vCardDownloadsThisWeek.toString()],
      ['Téléchargements ce mois', statsData.vCardDownloadsThisMonth.toString()],
      [''],
      ['Appareil', 'Nombre de scans'],
      ...statsData.topDevices.map(device => [device.device, device.count.toString()]),
      [''],
      ['Scans récents'],
      ['Date/Heure', 'Appareil', 'Localisation', 'Type'],
      ...statsData.recentScans.map(scan => [
        formatDate(scan.timestamp),
        scan.device,
        scan.location,
        scan.isUnique ? 'Unique' : 'Retour'
      ]),
      [''],
      ['Téléchargements récents'],
      ['Date/Heure', 'Appareil', 'Localisation', 'Type'],
      ...statsData.recentVCardDownloads.map(download => [
        formatDate(download.timestamp),
        download.device,
        download.location,
        download.isUnique ? 'Unique' : 'Retour'
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiques-qr-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Statistiques du profil</h1>
              <p className="text-sm sm:text-base text-gray-600">Analysez les performances de votre QR code</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="day">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
              <button
                onClick={handleExportData}
                className="flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exporter</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 border border-white/20">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Vue d'ensemble</span>
                <span className="sm:hidden">Vue</span>
              </button>
              <button
                onClick={() => setActiveTab('scans')}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'scans'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Scans</span>
                <span className="sm:hidden">Scans</span>
              </button>
              <button
                onClick={() => setActiveTab('downloads')}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'downloads'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Téléchargements</span>
                <span className="sm:hidden">Downloads</span>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Information */}
        <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200/50 mb-6 sm:mb-8">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Eye className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Respect de la vie privée</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Données collectées automatiquement :</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Type d'appareil et navigateur (anonyme)</li>
                  <li>Date et heure du scan</li>
                  <li>Localisation approximative : quartier, ville, pays (via IP)</li>
                </ul>
                <p className="text-xs text-blue-600 mt-3">
                  <strong>Note :</strong> Aucune demande d'autorisation n'est faite. 
                  La localisation est approximative et basée sur l'adresse IP (précision : quartier/ville).
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Contenu selon l'onglet actif */}
        {activeTab === 'overview' && (
          <>
            {/* Statistiques principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Total scans</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.totalScans}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Scans uniques</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.uniqueScans}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Aujourd'hui</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.scansToday}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Cette semaine</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.scansThisWeek}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques téléchargements */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Téléchargements de contacts</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Total téléchargements</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.totalVCardDownloads || 0}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Download className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Téléchargements uniques</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.uniqueVCardDownloads || 0}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Aujourd'hui</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.vCardDownloadsToday || 0}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Cette semaine</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.vCardDownloadsThisWeek || 0}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message informatif si pas de téléchargements */}
              {(statsData?.totalVCardDownloads || 0) === 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                      <Download className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Aucun téléchargement encore</p>
                      <p className="text-xs text-blue-700">
                        Les statistiques de téléchargements apparaîtront ici une fois que quelqu'un téléchargera votre carte de visite depuis votre profil public.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'scans' && (
          <>
            {/* Statistiques scans uniquement */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Total scans</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.totalScans}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Scans uniques</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.uniqueScans}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Aujourd'hui</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.scansToday}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Cette semaine</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.scansThisWeek}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'downloads' && (
          <>
            {/* Statistiques téléchargements uniquement */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Total téléchargements</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.totalVCardDownloads || 0}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Download className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Téléchargements uniques</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.uniqueVCardDownloads || 0}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Aujourd'hui</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.vCardDownloadsToday || 0}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Cette semaine</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{statsData?.vCardDownloadsThisWeek || 0}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Device Distribution - visible dans overview et scans */}
        {(activeTab === 'overview' || activeTab === 'scans') && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Types d'appareils</h3>
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Smartphone className="h-4 w-4 mr-1" />
              <span>Mobile</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Découvrez sur quels appareils votre QR code est le plus scanné.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {statsData?.topDevices && statsData.topDevices.length > 0 ? (
              statsData.topDevices.map((device, index) => (
                <div key={device.device} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center flex-1 min-w-0">
                    <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-900 truncate">{device.device}</span>
                  </div>
                  <span className="text-sm sm:text-base text-gray-600 font-semibold ml-2">{device.count}</span>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune donnée d'appareil</p>
                <p className="text-xs">Les types d'appareils apparaîtront ici après les premiers scans</p>
              </div>
            )}
          </div>
          </div>
        )}

        {/* Recent Scans - visible uniquement dans scans */}
        {activeTab === 'scans' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Scans récents</h3>
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Eye className="h-4 w-4 mr-1" />
              <span>Activité</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Historique détaillé des derniers scans de votre QR code.
          </p>
          
          {statsData?.recentScans && statsData.recentScans.length > 0 ? (
            <div className="space-y-3">
              {/* Version mobile - cartes */}
              <div className="block sm:hidden">
                {statsData.recentScans.map((scan) => (
                  <div key={scan.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{formatDate(scan.timestamp)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        scan.isUnique 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {scan.isUnique ? 'Unique' : 'Retour'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Smartphone className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="text-gray-900">{scan.device}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="text-gray-600">{scan.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Version desktop - tableau */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Date/Heure</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Appareil</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Localisation</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData?.recentScans?.map((scan) => (
                      <tr key={scan.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDate(scan.timestamp)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{scan.device}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{scan.location}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.isUnique 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {scan.isUnique ? 'Unique' : 'Retour'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun scan récent</p>
              <p className="text-xs">Les scans apparaîtront ici une fois votre QR code utilisé</p>
            </div>
          )}
          </div>
        )}

        {/* Recent VCard Downloads - visible uniquement dans downloads */}
        {activeTab === 'downloads' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Téléchargements récents</h3>
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Download className="h-4 w-4 mr-1" />
              <span>Contacts</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Historique des téléchargements de votre carte de visite.
          </p>
          
          {statsData?.recentVCardDownloads && statsData.recentVCardDownloads.length > 0 ? (
            <div className="space-y-3">
              {/* Version mobile - cartes */}
              <div className="block sm:hidden">
                {statsData.recentVCardDownloads.map((download) => (
                  <div key={download.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{formatDate(download.timestamp)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        download.isUnique 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {download.isUnique ? 'Unique' : 'Retour'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Smartphone className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="text-gray-900">{download.device}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="text-gray-600">{download.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Version desktop - tableau */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600">Date</th>
                      <th className="text-left py-2 text-gray-600">Appareil</th>
                      <th className="text-left py-2 text-gray-600">Localisation</th>
                      <th className="text-left py-2 text-gray-600">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.recentVCardDownloads.map((download) => (
                      <tr key={download.id} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{formatDate(download.timestamp)}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <Smartphone className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{download.device}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{download.location}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            download.isUnique 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {download.isUnique ? 'Unique' : 'Retour'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun téléchargement récent</p>
              <p className="text-xs">Les téléchargements apparaîtront ici une fois votre carte téléchargée</p>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
