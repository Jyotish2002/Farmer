import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Settings, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleRefresh = () => {
    window.location.reload();
    toast.success(t('dashboardRefreshed'));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: App Name + Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-yellow-400 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-green-800 font-bold text-sm">🌾</span>
            </div>
            <h1 className="text-xl font-bold text-white">{t('appName')}</h1>
          </Link>

          {/* Right: Refresh & Settings */}
          <div className="flex items-center space-x-3">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 shadow-md"
              title={t('refresh')}
            >
              <RefreshCw className="h-5 w-5 text-yellow-300" />
            </button>

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 shadow-md"
              title={t('settings')}
            >
              <Settings className="h-5 w-5 text-yellow-300" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;