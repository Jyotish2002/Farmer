import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const TopNavbar = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleRefresh = () => {
    window.location.reload();
    toast.success(t('dashboardRefreshed') || 'Dashboard refreshed!');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-[56px]">
          {/* Left: App Name + Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-yellow-400 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-green-800 font-bold text-sm">🌾</span>
            </div>
            <h1 className="text-lg font-bold text-white drop-shadow-sm">{t('appName') || 'Krishi'}</h1>
          </Link>

          {/* Right: Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 shadow-md active:scale-95"
            title={t('refresh') || 'Refresh'}
          >
            <RefreshCw className="h-5 w-5 text-yellow-300" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;