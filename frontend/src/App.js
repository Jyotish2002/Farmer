import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import YieldPrediction from './pages/YieldPrediction';
import PestDetection from './pages/PestDetection';
import Chatbot from './pages/Chatbot';
import AdminPanel from './pages/AdminPanel';
import SettingsPage from './pages/SettingsPage';
import BottomNavigation from './components/BottomNavigation';
import TopNavbar from './components/TopNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <TopNavbar />
          <div className="flex-1 pb-20"> {/* Add padding bottom for bottom nav */}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crop-recommendation"
                element={
                  <ProtectedRoute>
                    <CropRecommendation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/yield-prediction"
                element={
                  <ProtectedRoute>
                    <YieldPrediction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pest-detection"
                element={
                  <ProtectedRoute>
                    <PestDetection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chatbot"
                element={
                  <ProtectedRoute>
                    <Chatbot />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          <BottomNavigation />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

// Auth callback component to handle OAuth redirect
function AuthCallback() {
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      window.location.href = '/dashboard';
    } else if (error) {
      window.location.href = '/login?error=' + error;
    } else {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default App;