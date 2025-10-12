'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Share2, 
  Download,
  QrCode,
  Smartphone
} from 'lucide-react';

// Composant compteur animé pour le dashboard
function DashboardCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(progress * end);
      setCount(currentCount);
      
      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span className="text-2xl font-bold text-gray-900">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function DashboardMiniature() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: "Analytics", icon: BarChart3 },
    { name: "Profil", icon: Users },
    { name: "Partage", icon: Share2 }
  ];

  const stats = [
    { label: "Vues", value: 1247, icon: Eye, color: "text-blue-400" },
    { label: "Scans", value: 892, icon: QrCode, color: "text-green-400" },
    { label: "Partages", value: 156, icon: Share2, color: "text-purple-400" },
    { label: "Downloads", value: 89, icon: Download, color: "text-orange-400" }
  ];

  return (
    <div className="phone-container relative">
      {/* Couches de rectangles avec effet néon */}
      <div className="absolute -top-6 -left-6 w-96 h-[700px] bg-gradient-to-br from-blue-200/20 to-purple-200/15 rounded-3xl blur-lg"></div>
      <div className="absolute -top-4 -left-4 w-92 h-[680px] bg-gradient-to-br from-orange-200/25 to-pink-200/20 rounded-3xl blur-md"></div>
      <div className="absolute -top-2 -left-2 w-88 h-[660px] bg-gradient-to-br from-green-200/20 to-cyan-200/15 rounded-3xl blur-sm"></div>
      
      {/* Conteneur principal du dashboard */}
      <div className="relative w-84 h-[640px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 z-10 overflow-hidden">
        {/* Header du dashboard */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">QR Pro Dashboard</h3>
                <p className="text-white/80 text-sm">Tableau de bord</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex bg-gray-100/50 border-b border-gray-200/50">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === index 
                  ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Contenu du dashboard */}
        <div className="p-6 h-[480px] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
          {activeTab === 0 && (
            <div className="space-y-6">
              {/* Statistiques principales */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="glass-effect rounded-xl p-4 border border-white/40">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <DashboardCounter end={stat.value} duration={2000 + index * 500} />
                    <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Graphique simple */}
              <div className="glass-effect rounded-xl p-4 border border-white/40">
                <h4 className="text-gray-900 font-semibold mb-4">Activité des 7 derniers jours</h4>
                <div className="flex items-end justify-between h-32 space-x-2">
                  {[65, 78, 45, 89, 92, 67, 85].map((height, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="bg-gradient-to-t from-primary-500 to-primary-400 rounded-t w-6 transition-all duration-1000"
                        style={{ 
                          height: `${height}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      ></div>
                      <span className="text-gray-500 text-xs">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code miniature */}
              <div className="glass-effect rounded-xl p-4 border border-white/40 text-center">
                <div className="w-24 h-24 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center shadow-lg p-2">
                  <svg width="80" height="80" viewBox="0 0 25 25" className="w-full h-full">
                    <rect width="25" height="25" fill="white"/>
                    <rect x="2" y="2" width="7" height="7" fill="black"/>
                    <rect x="11" y="2" width="7" height="7" fill="black"/>
                    <rect x="2" y="11" width="7" height="7" fill="black"/>
                    <rect x="11" y="11" width="3" height="3" fill="black"/>
                    <rect x="16" y="11" width="2" height="2" fill="black"/>
                    <rect x="11" y="16" width="3" height="3" fill="black"/>
                    <rect x="16" y="16" width="2" height="2" fill="black"/>
                    <rect x="2" y="20" width="3" height="3" fill="black"/>
                    <rect x="7" y="20" width="2" height="2" fill="black"/>
                    <rect x="11" y="20" width="3" height="3" fill="black"/>
                    <rect x="16" y="20" width="2" height="2" fill="black"/>
                    <rect x="20" y="2" width="3" height="3" fill="black"/>
                    <rect x="20" y="7" width="2" height="2" fill="black"/>
                    <rect x="20" y="11" width="3" height="3" fill="black"/>
                    <rect x="20" y="16" width="2" height="2" fill="black"/>
                    <rect x="20" y="20" width="3" height="3" fill="black"/>
                    <rect x="4" y="4" width="3" height="3" fill="white"/>
                    <rect x="13" y="4" width="3" height="3" fill="white"/>
                    <rect x="4" y="13" width="3" height="3" fill="white"/>
                    <rect x="13" y="13" width="1" height="1" fill="white"/>
                    <rect x="17" y="13" width="1" height="1" fill="white"/>
                    <rect x="13" y="17" width="1" height="1" fill="white"/>
                    <rect x="17" y="17" width="1" height="1" fill="white"/>
                    <rect x="3" y="21" width="1" height="1" fill="white"/>
                    <rect x="8" y="21" width="1" height="1" fill="white"/>
                    <rect x="13" y="21" width="1" height="1" fill="white"/>
                    <rect x="17" y="21" width="1" height="1" fill="white"/>
                    <rect x="21" y="3" width="1" height="1" fill="white"/>
                    <rect x="21" y="8" width="1" height="1" fill="white"/>
                    <rect x="21" y="13" width="1" height="1" fill="white"/>
                    <rect x="21" y="17" width="1" height="1" fill="white"/>
                    <rect x="21" y="21" width="1" height="1" fill="white"/>
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">Votre QR Code</p>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="glass-effect rounded-xl p-4 border border-white/40">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">MF</span>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold">Moussa Fall</h4>
                    <p className="text-gray-600 text-sm">DG d'une entreprise</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-700 text-sm">
                    <Smartphone className="h-4 w-4 text-primary-500" />
                    <span>0408489575</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700 text-sm">
                    <span className="text-primary-500">📧</span>
                    <span>moussa321@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="glass-effect rounded-xl p-4 border border-white/40">
                <h4 className="text-gray-900 font-semibold mb-4">Partage récent</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">W</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">WhatsApp</p>
                      <p className="text-gray-500 text-xs">Il y a 2 heures</p>
                    </div>
                    <span className="text-green-500 text-sm font-medium">+12 scans</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">L</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">LinkedIn</p>
                      <p className="text-gray-500 text-xs">Hier</p>
                    </div>
                    <span className="text-green-500 text-sm font-medium">+8 scans</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
