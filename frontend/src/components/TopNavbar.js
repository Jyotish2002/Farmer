import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { RefreshCw, Bell, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TopNavbar = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleRefresh = () => {
    window.location.reload();
    toast.success(t('dashboardRefreshed') || 'Dashboard refreshed!');
  };

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await axios.get('/api/notifications?active=true&limit=10');
        setNotifications(res.data.notifications || res.data || []);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read / clear selection
  const closeNotificationModal = () => setSelectedNotification(null);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
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

          {/* Right: Notification Bell + Refresh Button */}
          <div className="flex items-center space-x-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown(v => !v)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 shadow-md active:scale-95"
                title={t('notifications') || 'Notifications'}
              >
                <Bell className="h-5 w-5 text-yellow-300" />
              </button>
              {notifications && notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full text-[11px] px-1.5 py-0.5 font-bold">{notifications.length}</span>
              )}

              {/* Dropdown */}
              {openDropdown && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">{t('notifications') || 'Notifications'}</h4>
                      <button onClick={() => setOpenDropdown(false)} className="p-1 rounded-full hover:bg-gray-100">
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-600">{t('noAdvisoriesAvailable')}</div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n._id}
                          onClick={() => { setSelectedNotification(n); setOpenDropdown(false); }}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-sm">{n.title}</div>
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{n.content}</div>
                            </div>
                            <div className="ml-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 shadow-md active:scale-95"
              title={t('refresh') || 'Refresh'}
            >
              <RefreshCw className="h-5 w-5 text-yellow-300" />
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* Notification Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">{selectedNotification.title}</h3>
              <button onClick={closeNotificationModal} className="p-2 rounded-full hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedNotification.content}</p>
              <div className="mt-4 text-xs text-gray-500">{new Date(selectedNotification.createdAt).toLocaleString()}</div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={closeNotificationModal} className="px-4 py-2 bg-green-500 text-white rounded-lg">{t('close') || 'Close'}</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default TopNavbar;