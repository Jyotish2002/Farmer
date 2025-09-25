import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprout, TrendingUp, Bug, Settings, LogOut, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name - Left Corner */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-800">{t('appName')}</span>
            </Link>
          </div>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex space-x-8 flex-1 justify-center">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('dashboard')}
            </Link>
            <Link
              to="/crop-recommendation"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Sprout className="h-4 w-4" />
              <span>{t('cropRecommendation')}</span>
            </Link>
            <Link
              to="/yield-prediction"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{t('yieldPrediction')}</span>
            </Link>
            <Link
              to="/pest-detection"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Bug className="h-4 w-4" />
              <span>{t('pestDetection')}</span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Right Side: Language Selector and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray-600" />
              <select 
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {user?.name || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600 p-2 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          {/* Mobile Language Selector */}
          <div className="flex items-center justify-center space-x-2 mb-4 px-3">
            <Globe className="h-5 w-5 text-gray-600" />
            <select 
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('dashboard')}
            </Link>
            <Link
              to="/crop-recommendation"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('cropRecommendation')}
            </Link>
            <Link
              to="/yield-prediction"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('yieldPrediction')}
            </Link>
            <Link
              to="/pest-detection"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('pestDetection')}
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;