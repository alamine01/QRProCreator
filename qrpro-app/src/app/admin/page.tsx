'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminNavigation } from '@/components/layout/AdminNavigation';
import { useAdminStats, useAdminOrders, useAdminUsers, useAdminDocuments } from '@/hooks/useAdminData';
import { 
  FaUsers, 
  FaCreditCard, 
  FaShoppingCart, 
  FaChartBar, 
  FaCog,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFileUpload,
  FaDownload,
  FaQrcode
} from 'react-icons/fa';
import { AdminPageLoader } from '@/components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Utiliser les hooks optimisés avec cache
  const { stats, loading: statsLoading } = useAdminStats();
  const { orders: recentOrders, loading: ordersLoading } = useAdminOrders({ limit: 5 });
  const { users: recentUsers, loading: usersLoading } = useAdminUsers({ limit: 5 });
  const { documents: recentDocuments, loading: documentsLoading } = useAdminDocuments({ limit: 5 });

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/auth/signin');
      return;
    }
  }, [user, loading, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'processing':
        return <FaClock className="text-blue-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isLoading = loading || statsLoading || ordersLoading || usersLoading;

  if (isLoading) {
    return <AdminPageLoader />;
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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Tableau de Bord Admin
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez les utilisateurs, commandes et cartes de visite
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <FaCog className="mr-1" />
                Administrateur
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 mb-2 sm:mb-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Utilisateurs</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 mb-2 sm:mb-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FaShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Commandes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 mb-2 sm:mb-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FaCreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Cartes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalBusinessCards || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 mb-2 sm:mb-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FaClock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">En Attente</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 mb-2 sm:mb-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FaFileUpload className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Documents</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{recentDocuments?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/business-cards')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <FaCreditCard className="mr-2" />
              Gérer les Cartes
            </button>
            <button
              onClick={() => router.push('/admin/orders')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <FaShoppingCart className="mr-2" />
              Gérer les Commandes
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <FaUsers className="mr-2" />
              Gérer les Utilisateurs
            </button>
            <button
              onClick={() => router.push('/admin/documents')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <FaFileUpload className="mr-2" />
              Gérer les Documents
            </button>
            <button
              onClick={() => router.push('/admin/stickers')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <FaQrcode className="mr-2" />
              Gérer les Autocollants
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">Commandes Récentes</h2>
                <button
                  onClick={() => router.push('/admin/orders')}
                  className="text-sm text-[#F15A22] hover:text-[#F15A22]/80 font-medium"
                >
                  Voir tout
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {recentOrders?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune commande récente</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders?.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.customerInfo.firstName} {order.customerInfo.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Commande #{order.orderNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {order.totalAmount} FCFA
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Utilisateurs Récents</h2>
                <button
                  onClick={() => router.push('/admin/users')}
                  className="text-[#F15A22] hover:text-[#F15A22]/80 font-medium"
                >
                  Voir tout
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentUsers?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun utilisateur récent</p>
              ) : (
                <div className="space-y-4">
                  {recentUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.firstName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <FaUsers className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">Documents Récents</h2>
                <button
                  onClick={() => router.push('/admin/documents')}
                  className="text-sm text-[#F15A22] hover:text-[#F15A22]/80 font-medium"
                >
                  Voir tout
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {recentDocuments?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun document récent</p>
              ) : (
                <div className="space-y-4">
                  {recentDocuments?.map((document) => (
                    <div key={document.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg min-w-0">
                      <div className="flex items-start min-w-0 flex-1">
                        <div className="flex-shrink-0 mr-3">
                          <FaFileUpload className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="font-medium text-gray-900 text-sm leading-tight" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>
                            {document.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>
                            {document.originalName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-xs font-medium text-gray-900 whitespace-nowrap">
                          {document.downloadCount} téléchargements
                        </span>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {(() => {
                            try {
                              // Si c'est un Timestamp Firebase
                              if (document.uploadedAt?.toDate) {
                                return document.uploadedAt.toDate().toLocaleDateString('fr-FR');
                              }
                              // Si c'est déjà une date ou un timestamp
                              if (document.uploadedAt) {
                                return new Date(document.uploadedAt).toLocaleDateString('fr-FR');
                              }
                              return 'N/A';
                            } catch (error) {
                              console.error('Erreur formatage date:', error, document.uploadedAt);
                              return 'N/A';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
