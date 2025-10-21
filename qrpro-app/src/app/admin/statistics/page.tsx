'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/layout/AdminNavigation';
import { 
  FaArrowLeft,
  FaChartBar,
  FaUsers,
  FaShoppingCart,
  FaCreditCard,
  FaCalendar,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaDownload,
  FaFilter,
  FaRedo
} from 'react-icons/fa';
import { Order, User, BusinessCard } from '@/types';

interface Statistics {
  totalUsers: number;
  totalOrders: number;
  totalBusinessCards: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  }[];
}

export default function AdminStatistics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Statistics>({
    totalUsers: 0,
    totalOrders: 0,
    totalBusinessCards: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    userGrowth: 0,
    orderGrowth: 0,
    revenueGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [documentStats, setDocumentStats] = useState<any[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/auth/signin');
      return;
    }

    if (user?.isAdmin) {
      fetchStatistics();
      
      // Rafraîchir les statistiques toutes les 30 secondes
      const interval = setInterval(() => {
        console.log('🔄 [STATS] Rafraîchissement automatique des statistiques');
        fetchStatistics();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, loading, router, dateRange]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch basic stats (utiliser stats-real pour les données Firebase)
      const statsResponse = await fetch('/api/admin/stats-real');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(prev => ({ ...prev, ...statsData }));
      }

      // Fetch recent orders (utiliser orders-fix pour les données Firebase)
      const ordersResponse = await fetch('/api/admin/orders-fix?limit=10');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);
        
        // Ne pas recalculer le revenu ici - il vient déjà de stats-real
        console.log('📊 [STATS] Commandes récentes chargées:', ordersData.length);
      }

      // Fetch recent users
      const usersResponse = await fetch('/api/admin/users?limit=10');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setRecentUsers(usersData.success ? usersData.data : []);
      }

      // Fetch business cards
      const cardsResponse = await fetch('/api/admin/business-cards?limit=10');
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        setBusinessCards(cardsData);
      }

      // Fetch document statistics
      await fetchDocumentStatistics();
      
      // Fetch global document statistics
      await fetchGlobalDocumentStatistics();
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentStatistics = async () => {
    try {
      // Récupérer tous les documents
      const documentsResponse = await fetch('/api/admin/documents');
      if (documentsResponse.ok) {
        const documents = await documentsResponse.json();
        
        let totalScansCount = 0;
        let totalDownloadsCount = 0;
        const documentStatsArray = [];

        // Pour chaque document, récupérer les statistiques détaillées
        for (const doc of documents) {
          try {
            const statsResponse = await fetch(`/api/document-stats/${doc.id}?email=${doc.ownerEmail}&password=${doc.ownerPassword || ''}`);
            if (statsResponse.ok) {
              const stats = await statsResponse.json();
              
              // Utiliser les vrais compteurs des collections de tracking
              totalScansCount += stats.qrScans?.length || 0;
              totalDownloadsCount += stats.downloads?.length || 0;
              
              documentStatsArray.push({
                ...doc,
                qrScans: stats.qrScans || [],
                downloads: stats.downloads || [],
                // Numéroter les scans correctement (le plus récent = numéro le plus élevé)
                numberedScans: (stats.qrScans || []).map((scan: any, index: number) => ({
                  ...scan,
                  scanNumber: (stats.qrScans || []).length - index
                }))
              });
            }
          } catch (error) {
            console.log(`Erreur pour document ${doc.id}:`, error);
          }
        }

        setDocumentStats(documentStatsArray);
        setTotalScans(totalScansCount);
        setTotalDownloads(totalDownloadsCount);
        
        console.log('📊 Statistiques documents:', {
          totalDocuments: documentStatsArray.length,
          totalScans: totalScansCount,
          totalDownloads: totalDownloadsCount
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de documents:', error);
    }
  };

  const fetchGlobalDocumentStatistics = async () => {
    try {
      console.log('📊 Récupération des statistiques globales...');
      const response = await fetch('/api/admin/document-stats-global');
      if (response.ok) {
        const globalStats = await response.json();
        
        setTotalScans(globalStats.totalScans);
        setTotalDownloads(globalStats.totalDownloads);
        
        console.log('📊 Statistiques globales mises à jour:', {
          totalScans: globalStats.totalScans,
          totalDownloads: globalStats.totalDownloads,
          weeklyScans: globalStats.weeklyScans,
          totalDocuments: globalStats.totalDocuments
        });
      } else {
        console.log('⚠️ Erreur lors de la récupération des statistiques globales');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques globales:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      let date: Date;
      
      // Gérer différents formats de timestamp
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        // Firebase Timestamp
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        // Firebase Timestamp avec seconds
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'string') {
        // String ISO
        date = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        // Timestamp numérique
        date = new Date(timestamp);
      } else {
        // Objet Date ou autre
        date = new Date(timestamp);
      }
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn('Date invalide:', timestamp);
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error, timestamp);
      return 'Erreur date';
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <FaArrowUp className="text-green-500" />
    ) : (
      <FaArrowDown className="text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
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

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminNavigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-2 sm:mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Statistiques et Analyses
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Tableau de bord analytique complet
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent text-sm sm:text-base"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
                <option value="1y">1 an</option>
              </select>
              <button
                onClick={fetchStatistics}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                <FaRedo className="mr-2" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Utilisateurs Totaux</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stats.totalUsers}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(stats.userGrowth)}
                  <span className={`text-xs sm:text-sm ml-1 ${getGrowthColor(stats.userGrowth)} truncate`}>
                    {Math.abs(stats.userGrowth)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Commandes Totales</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stats.totalOrders}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(stats.orderGrowth)}
                  <span className={`text-xs sm:text-sm ml-1 ${getGrowthColor(stats.orderGrowth)} truncate`}>
                    {Math.abs(stats.orderGrowth)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                <FaShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Revenus Totaux</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(stats.revenueGrowth)}
                  <span className={`text-xs sm:text-sm ml-1 ${getGrowthColor(stats.revenueGrowth)} truncate`}>
                    {Math.abs(stats.revenueGrowth)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                <FaChartBar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Panier Moyen</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(stats.averageOrderValue)}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">Par commande</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                <FaArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Document Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Téléchargements</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{totalDownloads}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((totalDownloads / Math.max(totalDownloads, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                <FaDownload className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Scans QR</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{totalScans}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((totalScans / Math.max(totalScans, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                <FaEye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Documents</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{documentStats.length}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((documentStats.length / Math.max(documentStats.length, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                <FaChartBar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Cette semaine</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {documentStats.reduce((acc, doc) => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return acc + (doc.qrScans || []).filter((scan: any) => {
                      const scanDate = scan.timestamp?.toDate ? scan.timestamp.toDate() : new Date(scan.timestamp);
                      return scanDate >= weekAgo;
                    }).length;
                  }, 0)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((documentStats.reduce((acc, doc) => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return acc + (doc.qrScans || []).filter((scan: any) => {
                        const scanDate = scan.timestamp?.toDate ? scan.timestamp.toDate() : new Date(scan.timestamp);
                        return scanDate >= weekAgo;
                      }).length;
                    }, 0) / Math.max(totalScans, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                <FaCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Commandes Récentes</h2>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <FaShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune commande récente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#F15A22] rounded-full flex items-center justify-center text-white text-sm font-medium">
                          #{order.orderNumber.slice(-2)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {order.customerInfo.firstName} {order.customerInfo.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Nouveaux Utilisateurs</h2>
            </div>
            <div className="p-6">
              {!recentUsers || recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <FaUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun nouvel utilisateur</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(recentUsers || []).slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </p>
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Cards Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Cartes de Visite</h2>
              <span className="text-sm text-gray-500">{stats.totalBusinessCards} cartes créées</span>
            </div>
          </div>
          <div className="p-6">
            {businessCards.length === 0 ? (
              <div className="text-center py-8">
                <FaCreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune carte de visite créée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessCards.slice(0, 6).map((card) => (
                  <div key={card.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-600 font-medium text-sm">
                          {card.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{card.name}</p>
                        <p className="text-sm text-gray-500">{card.title}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{card.email}</p>
                      <p>{card.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
