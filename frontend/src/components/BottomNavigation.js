import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Home,
  TestTube,
  Bug,
  TrendingUp,
  Settings
} from 'lucide-react';

const BottomNavigation = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const navigationItems = [
    {
      name: t('dashboard'),
      path: '/dashboard',
      icon: Home,
      active: location.pathname === '/dashboard'
    },
    {
      name: t('cropRecommendation'),
      path: '/crop-recommendation',
      icon: TestTube,
      active: location.pathname === '/crop-recommendation'
    },
    {
      name: t('yieldPrediction'),
      path: '/yield-prediction',
      icon: TrendingUp,
      active: location.pathname === '/yield-prediction'
    },
    {
      name: t('pestDetection'),
      path: '/pest-detection',
      icon: Bug,
      active: location.pathname === '/pest-detection'
    },
    {
      name: t('settings'),
      path: '/settings',
      icon: Settings,
      active: location.pathname === '/settings'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl z-50 safe-area-bottom">
      <div className="flex items-center justify-center px-3 py-1.5 max-w-md mx-auto">
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-2 py-2 rounded-xl transition-all duration-300 min-w-[55px] relative mx-2 ${
                item.active
                  ? 'bg-green-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <div className={`relative mb-0.5 ${item.active ? 'animate-pulse' : ''}`}>
                <IconComponent
                  className={`h-5 w-5 transition-all duration-300 ${
                    item.active ? 'scale-110 drop-shadow-sm' : ''
                  }`}
                />
                {item.active && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
                )}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight transition-all duration-300 ${
                item.active ? 'font-semibold' : ''
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;