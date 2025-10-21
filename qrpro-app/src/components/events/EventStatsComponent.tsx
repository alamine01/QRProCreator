'use client';

import { useEffect, useState } from 'react';
import { 
  FaUsers, 
  FaClock, 
  FaChartLine, 
  FaCalendarDay,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';
import { EventStats } from '@/types/events';

interface EventStatsComponentProps {
  eventId: string;
  className?: string;
}

export default function EventStatsComponent({ eventId, className = '' }: EventStatsComponentProps) {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchStats();
    // Mettre à jour les stats toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeakHourLabel = (hour: string) => {
    if (!hour) return 'N/A';
    return `${hour}h`;
  };

  const getHourlyTrend = () => {
    if (!stats || !stats.checkinsByHour) return 'stable';
    
    const hours = Object.keys(stats.checkinsByHour).map(Number).sort();
    if (hours.length < 2) return 'stable';
    
    const recent = hours.slice(-2);
    const current = stats.checkinsByHour[recent[1].toString()] || 0;
    const previous = stats.checkinsByHour[recent[0].toString()] || 0;
    
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <FaArrowDown className="w-3 h-3 text-red-500" />;
      default:
        return <FaMinus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
        <p className="text-gray-500 text-center">Aucune donnée disponible</p>
      </div>
    );
  }

  const trend = getHourlyTrend();

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Statistiques en temps réel</h3>
        <div className="flex items-center text-xs text-gray-500">
          <FaClock className="w-3 h-3 mr-1" />
          Mis à jour à {lastUpdate.toLocaleTimeString('fr-FR')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Check-ins */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Check-ins</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalCheckins}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FaUsers className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Heure de pointe */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Heure de pointe</p>
              <p className="text-2xl font-bold text-green-900">{getPeakHourLabel(stats.peakHour)}</p>
            </div>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <FaChartLine className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Moyenne par heure */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Moyenne/heure</p>
              <p className="text-2xl font-bold text-purple-900">{Math.round(stats.averageCheckinsPerHour)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <FaClock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Tendance */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Tendance</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-orange-900 mr-2">
                  {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
                </p>
                {getTrendIcon(trend)}
              </div>
            </div>
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <FaCalendarDay className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des check-ins par heure */}
      {stats.checkinsByHour && Object.keys(stats.checkinsByHour).length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Check-ins par heure</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end justify-between h-32 space-x-1">
              {Object.entries(stats.checkinsByHour)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([hour, count]) => {
                  const maxCount = Math.max(...Object.values(stats.checkinsByHour));
                  const height = (count / maxCount) * 100;
                  
                  return (
                    <div key={hour} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                        title={`${hour}h: ${count} check-ins`}
                      ></div>
                      <span className="text-xs text-gray-600 mt-1">{hour}h</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Bouton de rafraîchissement */}
      <div className="mt-4 text-center">
        <button
          onClick={fetchStats}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Actualiser les statistiques
        </button>
      </div>
    </div>
  );
}
