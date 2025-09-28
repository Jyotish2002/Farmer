import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprout } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, loading, demoLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  const handleGoogleLogin = () => {
    // Use an absolute backend URL when provided at build time (REACT_APP_API_URL).
    // This is important when the frontend is deployed on a different host than the backend
    // (for example, frontend on Netlify/Vercel and backend on Render). If no API URL
    // is provided, fall back to a same-origin serverless path (used for monorepo Vercel setups).
    const apiBase = process.env.REACT_APP_API_URL || '';

    if (apiBase) {
      // Explicit backend URL configured (recommended for separate deployments)
      window.location.href = `${apiBase.replace(/\/$/, '')}/auth/google`;
      return;
    }

    // No explicit backend configured — assume backend lives on the same origin under /api
    // (this matches serverless setups where backend functions are mounted at /api)
    window.location.href = '/api/auth/google';
  };

  const handleDemoLogin = () => {
    demoLogin();
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Sprout className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('appName')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('tagline')}
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  {t('signInToAccount')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  {t('accessInsights')}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t('continueWithGoogle')}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">{t('forDevelopment')}</span>
                  </div>
                </div>

                <button
                  onClick={handleDemoLogin}
                  className="w-full flex justify-center items-center px-4 py-3 border-2 border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <Sprout className="w-5 h-5 mr-3" />
                  {t('demoLogin')}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {t('termsAgreement')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;