import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Globe, Save, Check, Info, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, this would make an API call to update the user's name
      // For now, we'll just update the local state
      updateUser({ ...user, name: name.trim() });
      toast.success('Name updated successfully!');
    } catch (error) {
      console.error('Failed to update name:', error);
      toast.error('Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    toast.success('Language changed successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-100 bottom-safe-area app-scroll pt-14">
      {/* Mobile-first responsive container */}
      <div className="max-w-md mx-auto lg:max-w-2xl bg-white min-h-screen shadow-xl pb-16"> {/* Reduced bottom padding */}
        {/* User Profile Section */}
        <div className="px-4 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{user?.name || 'Demo Farmer'}</h2>
              <p className="text-sm text-gray-500">{user?.email || 'demo@farmer.com'}</p>
              <p className="text-xs text-green-600 font-medium">Active User</p>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="divide-y divide-gray-200">
          {/* Profile Settings */}
          <div className="px-4 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Profile Settings</h3>
                <p className="text-sm text-gray-500">Update your personal information</p>
              </div>
            </div>
            
            {/* Name Input - Mobile optimized */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  placeholder="Enter your name"
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving || name === user?.name}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      <span className="hidden sm:inline">Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="px-4 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Language</h3>
                <p className="text-sm text-gray-500">Choose your preferred language</p>
              </div>
            </div>
            
            {/* Language Options - Mobile Cards */}
            <div className="space-y-3">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    currentLanguage === lang.code
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{lang.code === 'english' ? '🇺🇸' : lang.code === 'hindi' ? '🇮🇳' : '🇮🇳'}</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{lang.nativeName}</p>
                      <p className="text-sm text-gray-500">{lang.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {currentLanguage === lang.code && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* App Information */}
          <div className="px-4 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Info className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">App Information</h3>
                <p className="text-sm text-gray-500">About this application</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Version</span>
                  <span className="text-sm font-semibold text-gray-900">1.0.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Build</span>
                  <span className="text-sm font-semibold text-gray-900">2024.1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Developer</span>
                  <span className="text-sm font-semibold text-gray-900">Krishi Team</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="px-4 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Account</h3>
                <p className="text-sm text-gray-500">Manage your account</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all"
            >
              <LogOut className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-700">Logout</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-8 text-center border-t border-gray-200">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Made with ❤️ for farmers everywhere
            </p>
            <p className="text-xs text-gray-400">
              Your trusted farming companion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;