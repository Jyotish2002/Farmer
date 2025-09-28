import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye,
  MessageSquare,
  Bot,
  Bug,
  TrendingUp,
  TestTube,
  X,
  Calendar,
  Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [coords, setCoords] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [liveTracking, setLiveTracking] = useState(false);
  const watchIdRef = useRef(null);
  const lastCoordsRef = useRef(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const isDemoMode = token === 'demo-jwt-token-123';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Try to get browser geolocation first (prompts user)
        // Mobile devices can be slow to respond or have flaky GPS. We'll attempt a
        // quick low-accuracy call first (short timeout) and if it fails due to
        // timeout we'll try a second attempt with longer timeout and allowHighAccuracy.
        const getPosition = (options = {}) =>
          new Promise((resolve, reject) => {
            if (!navigator?.geolocation) return reject(new Error('Geolocation not supported'));
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
          });

        if (!isDemoMode) {
          try {
            // Quick try: give browser 6s to return a cached or network-based position
            const quickOpts = { enableHighAccuracy: false, timeout: 6000, maximumAge: 5 * 60 * 1000 };
            let position = await getPosition(quickOpts).catch((err) => {
              // If quick attempt times out, try again with high accuracy and longer timeout
              if (err && err.code === 3) {
                console.info('Quick geolocation timed out, retrying with longer timeout');
                return getPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
              }
              throw err;
            });

            // If we still don't have position, fall back to profile/city silently
            if (position && position.coords) {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              setCoords({ lat, lon });
            }
          } catch (err) {
            console.warn('Geolocation unavailable or denied, falling back to profile/city', err);
          }
        }

        // Skip API calls in demo mode
        if (isDemoMode) {
          // Set demo data
          setWeather({
            location: { name: 'Kolkata', country: 'IN' },
            weather: { main: 'Clear', description: 'sunny', icon: '01d' },
            temperature: { current: 28, feels_like: 30, min: 22, max: 35 },
            humidity: 65,
            pressure: 1013,
            wind: { speed: 3.5, direction: 90 },
            visibility: 10000,
            clouds: 20,
            timestamp: Date.now()
          });

          setNotifications([
            {
              _id: 'demo-1',
              title: 'Weather Advisory: Clear Skies Expected',
              content: 'Favorable weather conditions for farming activities. Good time for irrigation and field preparation.',
              type: 'advisory',
              priority: 'medium',
              category: 'weather',
              postedBy: { name: 'Weather Department', role: 'admin' },
              createdAt: new Date().toISOString()
            },
            {
              _id: 'demo-2',
              title: 'New Fertilizer Subsidy Scheme',
              content: 'Government announces new subsidy scheme for organic fertilizers. Apply before month end.',
              type: 'notification',
              priority: 'high',
              category: 'policy',
              postedBy: { name: 'Agriculture Department', role: 'admin' },
              createdAt: new Date().toISOString()
            }
          ]);

          setLoading(false);
          return;
        }

        // Fetch initial weather using fallback city for non-demo users
        if (!isDemoMode) {
          try {
            const params = { city: user?.location || 'Kolkata' };
            const weatherResponse = await axios.get('/api/weather', { params });
            setWeather(weatherResponse.data);
          } catch (error) {
            console.error('Weather fetch failed:', error);
          }
        }

        // Fetch notifications
        try {
          const notificationsResponse = await axios.get('/api/notifications');
          const notifs = notificationsResponse.data.notifications.slice(0, 5);
          setNotifications(notifs);
          // Map notifications to recent activities
          const mapped = notifs.map(n => ({
            id: n._id,
            title: n.title,
            subtitle: n.content,
            icon: '📢',
            ts: new Date(n.createdAt).getTime()
          }));
          setActivities(prev => {
            const merged = [...mapped, ...prev.filter(a => !mapped.find(m => m.id === a.id))];
            return merged.sort((a, b) => b.ts - a.ts).slice(0, 8);
          });
        } catch (error) {
          console.error('Notifications fetch failed:', error);
        }

      } catch (error) {
        console.error('Dashboard data fetch failed:', error);
        toast.error(t('failedToLoadData'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isDemoMode, user?.location, t]); // Remove coords to prevent infinite loop

  // Separate effect to fetch weather when coords change (after initial load)
  useEffect(() => {
    const fetchWeatherForCoords = async () => {
      if (coords && !loading && !isDemoMode) {
        try {
          const weatherResponse = await axios.get(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`);
          setWeather(weatherResponse.data);
          setLastUpdated(Date.now());
          pushActivity({ id: `weather-${Date.now()}`, title: 'Weather refreshed', subtitle: `${Math.round(weatherResponse.data.temperature?.current || 0)}°C at your location`, icon: '🌤️', ts: Date.now() });
        } catch (error) {
          console.error('Weather fetch failed:', error);
        }
      }
    };

    fetchWeatherForCoords();
  }, [coords, loading, isDemoMode]);

  // fetchDashboardData removed: loadData inside useEffect handles initial loading



  // Removed mobile header functions since we now use the main Navbar component

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const fetchWeatherForecast = async () => {
    setLoadingForecast(true);
    try {
      if (isDemoMode) {
        // Demo 5-day forecast data
        setWeatherForecast({
          location: { name: 'Kolkata', country: 'IN' },
          forecast: [
            {
              date: new Date(Date.now() + 24 * 60 * 60 * 1000),
              weather: { main: 'Clear', description: 'sunny', icon: '01d' },
              temperature: { min: 24, max: 32 },
              humidity: 60,
              wind: { speed: 4.2 },
              rain: { probability: 10, amount: 0 },
              pressure: 1015
            },
            {
              date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              weather: { main: 'Clouds', description: 'partly cloudy', icon: '02d' },
              temperature: { min: 26, max: 30 },
              humidity: 70,
              wind: { speed: 3.8 },
              rain: { probability: 30, amount: 0.5 },
              pressure: 1012
            },
            {
              date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              weather: { main: 'Rain', description: 'light rain', icon: '10d' },
              temperature: { min: 22, max: 28 },
              humidity: 85,
              wind: { speed: 5.1 },
              rain: { probability: 80, amount: 8.2 },
              pressure: 1008
            },
            {
              date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
              weather: { main: 'Rain', description: 'moderate rain', icon: '10d' },
              temperature: { min: 20, max: 25 },
              humidity: 90,
              wind: { speed: 6.3 },
              rain: { probability: 95, amount: 15.6 },
              pressure: 1005
            },
            {
              date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
              weather: { main: 'Clouds', description: 'overcast', icon: '04d' },
              temperature: { min: 23, max: 29 },
              humidity: 75,
              wind: { speed: 4.8 },
              rain: { probability: 40, amount: 2.1 },
              pressure: 1010
            }
          ]
        });
      } else {
        const params = coords ? { lat: coords.lat, lon: coords.lon } : { city: user?.location || 'Kolkata' };
        const response = await axios.get('/api/weather/forecast', { params });
        setWeatherForecast(response.data);
      }
    } catch (error) {
      console.error('Weather forecast fetch failed:', error);
      toast.error(t('failedToLoadForecast'));
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleWeatherClick = () => {
    setShowWeatherModal(true);
    if (!weatherForecast) {
      fetchWeatherForecast();
    }
  };

  // Haversine - meters between two coords
  const haversineMeters = (a, b) => {
    if (!a || !b) return Infinity;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDlat = Math.sin(dLat / 2);
    const sinDlon = Math.sin(dLon / 2);
    const aa = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };

  // Start/stop watchPosition when liveTracking toggles
  useEffect(() => {
    if (isDemoMode) return;
    if (!navigator?.geolocation) return;

  if (liveTracking) {
      // start watching
      try {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const newCoords = { lat, lon };
            const last = lastCoordsRef.current;
            const meters = haversineMeters(last, newCoords);
            // only update if moved significantly to avoid too many API calls
            if (!last || meters > 100) {
              lastCoordsRef.current = newCoords;
              setCoords(newCoords);
              setLastUpdated(Date.now());
            }
          },
          (err) => {
            console.warn('watchPosition error', err);
            toast.error('Unable to track location live');
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
        watchIdRef.current = id;
      } catch (err) {
        console.warn('Failed to start geolocation watch', err);
      }
  } else {
      // stop watching
      if (watchIdRef.current != null) {
        try {
          navigator.geolocation.clearWatch(watchIdRef.current);
        } catch (e) {}
        watchIdRef.current = null;
      }
    }

  return () => {
      if (watchIdRef.current != null) {
        try {
          navigator.geolocation.clearWatch(watchIdRef.current);
        } catch (e) {}
        watchIdRef.current = null;
      }
    };
  }, [liveTracking, isDemoMode]);

  // Update lastUpdated when coords is initially set (from getCurrentPosition)
  useEffect(() => {
    if (coords) setLastUpdated(Date.now());
  }, [coords]);

  // small time-ago formatter
  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // helper: add a local activity (used when AI chat or manual actions occur)
  const pushActivity = (item) => {
    setActivities(prev => {
      const merged = [item, ...prev];
      return merged.slice(0, 8);
    });
  };

  // show a toast when toggling live tracking to give instant feedback
  const handleLiveToggle = (enabled) => {
    setLiveTracking(enabled);
    if (enabled) {
      toast.success('Live location tracking enabled');
    } else {
      toast('Live location tracking paused');
    }
  };

  const quickActions = [
    {
      titleKey: 'soilAnalysis',
      icon: TestTube,
      path: '/crop-recommendation',
      descriptionKey: 'soilAnalysisDesc'
    },
    {
      titleKey: 'pestDetection',
      icon: Bug,
      path: '/pest-detection',
      descriptionKey: 'pestDetectionDesc'
    },
    {
      titleKey: 'yieldPrediction',
      icon: TrendingUp,
      path: '/yield-prediction',
      descriptionKey: 'yieldPredictionDesc'
    },
    {
      titleKey: 'aiChatAssistant',
      icon: Bot,
      path: '/chatbot',
      descriptionKey: 'aiChatAssistantDesc'
    }
  ];

  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return <Sun className="h-10 w-10 text-yellow-400 drop-shadow-lg animate-pulse" />;
      case 'clouds':
        return <Cloud className="h-10 w-10 text-blue-300 drop-shadow-lg" />;
      case 'rain':
        return <CloudRain className="h-10 w-10 text-blue-500 drop-shadow-lg animate-bounce" />;
      default:
        return <Cloud className="h-10 w-10 text-gray-300 drop-shadow-lg" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 bottom-safe-area app-scroll">
  <div className="px-4 pt-0 pb-16"> {/* Let navbar occupy natural flow; removed manual top padding */}
  {/* Greeting Section */}
  <div className="text-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-xl p-3 shadow-lg mb-4 join-top app-card">
          <h2 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
            {getGreeting()}, {user?.name?.split(' ')[0] || t('farmer')}! 🌱
          </h2>
          <p className="text-green-100 text-sm font-medium">{t('productiveDayMessage')}</p>
          <div className="mt-2 flex justify-center space-x-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-xs font-medium">🌞 Good Weather</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-xs font-medium">🚜 Ready to Farm</span>
            </div>
          </div>
        </div>

        {/* Weather Report Section */}
        <div 
          className="bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 rounded-xl shadow-xl p-1 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 mb-4"
          onClick={handleWeatherClick}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white mb-1 flex items-center drop-shadow-lg">
              <div className="flex items-center">
                <Cloud className="h-5 w-5 mr-2 text-yellow-300" />
                {t('weatherReport')}
              </div>
            </h3>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-blue-100 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={liveTracking}
                  onChange={(e) => handleLiveToggle(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-green-500"
                  title={t('liveLocationToggle')}
                />
                <span>{t('live')}</span>
              </label>
              <span className="text-xs text-blue-100 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium">
                {t('tapForForecast')}
              </span>
            </div>
          </div>

          {weather ? (
            <div className="space-y-0.5">
              <div className="flex items-center justify-between mb-1">
                <div />
                <div className="flex items-center space-x-3">
                  {liveTracking && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>
                  )}
                  {lastUpdated && (
                    <span className="text-xs text-white/90 bg-white/10 px-2 py-0.5 rounded-full">Updated {timeAgo(lastUpdated)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                {getWeatherIcon(weather.weather?.main)}
                <div>
                  <h4 className="font-bold text-white text-sm">{weather.location?.name}</h4>
                  <p className="text-blue-100 capitalize text-xs font-medium">{weather.weather?.description}</p>
                  <p className="text-yellow-300 text-base font-bold drop-shadow-lg">{Math.round(weather.temperature?.current)}°C</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0.5 pt-0.5 border-t border-white/20">
                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                  <Thermometer className="h-3 w-3 text-red-300" />
                  <div>
                    <p className="text-xs text-blue-100 font-medium">{t('feelsLike')}</p>
                    <p className="text-white text-xs font-bold">{Math.round(weather.temperature?.feels_like)}°C</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                  <Droplets className="h-3 w-3 text-cyan-300" />
                  <div>
                    <p className="text-xs text-blue-100 font-medium">{t('humidity')}</p>
                    <p className="text-white text-xs font-bold">{weather.humidity}%</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                  <Wind className="h-3 w-3 text-gray-300" />
                  <div>
                    <p className="text-xs text-blue-100 font-medium">{t('windSpeed')}</p>
                    <p className="text-white text-xs font-bold">{weather.wind?.speed} m/s</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                  <Eye className="h-3 w-3 text-purple-300" />
                  <div>
                    <p className="text-xs text-blue-100 font-medium">{t('visibility')}</p>
                    <p className="text-white text-xs font-bold">{(weather.visibility / 1000).toFixed(1)} km</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <Cloud className="h-8 w-8 text-white/70 mx-auto mb-2" />
                <p className="text-blue-100 text-sm font-medium">{t('weatherNotAvailable')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="bg-gradient-to-br from-white via-green-50 to-blue-50 rounded-2xl shadow-xl p-6 border border-green-100 mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-2 mr-3">
              <span className="text-white text-lg">⚡</span>
            </div>
            {t('quickActions')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              const colors = [
                'from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600',
                'from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600',
                'from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600',
                'from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600'
              ];
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br ${colors[index]} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1`}
                >
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 shadow-inner">
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-sm font-bold text-center leading-tight drop-shadow-lg">{t(action.titleKey)}</span>
                  <span className="text-xs text-white/90 mt-2 text-center leading-tight">{t(action.descriptionKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Government Notifications */}
        <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 rounded-2xl shadow-xl p-6 border border-orange-200 mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-2 mr-3">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            {t('govAdvisories')}
          </h3>

          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification._id}
                  className="bg-gradient-to-r from-orange-100 to-yellow-100 border-l-4 border-orange-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">📢</span>
                    {notification.title}
                  </h4>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2 leading-relaxed">{notification.content}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      notification.priority === 'high' ? 'bg-red-500 text-white shadow-md' :
                      notification.priority === 'medium' ? 'bg-yellow-500 text-white shadow-md' :
                      'bg-green-500 text-white shadow-md'
                    }`}>
                      {notification.priority === 'high' ? '🚨' : notification.priority === 'medium' ? '⚠️' : 'ℹ️'} {t(notification.priority)}
                    </span>
                    <span className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded-full font-medium">
                      📅 {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">{t('noAdvisoriesAvailable')}</p>
              </div>
            )}
          </div>
        </div>



        {/* Recent Activities Section - Moved to Bottom */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2 mr-3">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            Recent Activities
          </h3>
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="w-3 h-3 bg-gray-400 rounded-full shadow-sm" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 flex items-center">
                      <span className="mr-2">{act.icon}</span>
                      {act.title}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">{timeAgo(act.ts)}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 flex items-center">
                      <span className="mr-2">🌤️</span>
                      Weather forecast checked
                    </p>
                    <p className="text-xs text-gray-600 font-medium">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 flex items-center">
                      <span className="mr-2">📢</span>
                      Government advisory received
                    </p>
                    <p className="text-xs text-gray-600 font-medium">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 flex items-center">
                      <span className="mr-2">🤖</span>
                      AI chat consultation
                    </p>
                    <p className="text-xs text-gray-600 font-medium">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 flex items-center">
                      <span className="mr-2">🔄</span>
                      Dashboard refreshed
                    </p>
                    <p className="text-xs text-gray-600 font-medium">5 hours ago</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Weather Forecast Modal */}
      {showWeatherModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-blue-900/40 to-green-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-white via-blue-50 to-green-50 rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/20">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-green-600 rounded-t-3xl px-6 py-4 flex items-center justify-between shadow-lg">
              <h2 className="text-xl font-bold text-white drop-shadow-lg">{t('dayForecast')}</h2>
              <button
                onClick={() => setShowWeatherModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200"
                title={t('close')}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingForecast ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                  <span className="ml-3 text-gray-700 font-medium">{t('loadingForecast')}</span>
                </div>
              ) : weatherForecast ? (
                <div className="space-y-6">
                  {/* Current Location */}
                  <div className="text-center mb-6 bg-gradient-to-r from-blue-100 to-green-100 rounded-2xl p-4">
                    <h3 className="font-bold text-gray-800 text-lg">{weatherForecast.location?.name}</h3>
                    <p className="text-gray-600 font-medium">{t('extendedForecast')}</p>
                  </div>

                  {/* Forecast Cards */}
                  {weatherForecast.forecast?.map((day, index) => (
                    <div key={index} className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getWeatherIcon(day.weather?.main)}
                          <div>
                            <p className="font-bold text-gray-800 text-base">
                              {new Date(day.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-gray-600 capitalize font-medium">
                              {day.weather?.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-2xl text-blue-600 drop-shadow-sm">
                            {Math.round(day.temperature?.max)}°
                          </p>
                          <p className="text-sm text-gray-500 font-medium">
                            {Math.round(day.temperature?.min)}°
                          </p>
                        </div>
                      </div>

                      {/* Weather Details Grid */}
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-600">{t('rainChance')}</p>
                            <p className="text-sm font-medium">{day.rain?.probability}%</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <CloudRain className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">{t('rainfall')}</p>
                            <p className="text-sm font-medium">{day.rain?.amount != null ? `${Math.round(day.rain.amount * 10) / 10}mm` : '0mm'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Wind className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-600">{t('windSpeed')}</p>
                            <p className="text-sm font-medium">{day.wind?.speed} m/s</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Gauge className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-xs text-gray-600">{t('pressure')}</p>
                            <p className="text-sm font-medium">{day.pressure} hPa</p>
                          </div>
                        </div>
                      </div>

                      {/* Farming Advice */}
                      {day.rain?.probability > 70 && (
                        <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                          <p className="text-xs text-blue-800">
                            🌧️ {t('highRainChance')}
                          </p>
                        </div>
                      )}
                      
                      {day.wind?.speed > 5 && (
                        <div className="mt-2 p-2 bg-yellow-100 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            💨 {t('strongWindWarning')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Farming Tips */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-green-100 via-yellow-50 to-green-100 rounded-2xl border border-green-200 shadow-lg">
                    <h4 className="font-bold text-green-800 mb-4 flex items-center text-lg">
                      <div className="bg-green-500 rounded-full p-1 mr-2">
                        <span className="text-white text-sm">🌱</span>
                      </div>
                      {t('farmingRecommendations')}
                    </h4>
                    <ul className="text-green-700 space-y-2 font-medium">
                      <li className="flex items-center">
                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3">💧</span>
                        {t('planIrrigation')}
                      </li>
                      <li className="flex items-center">
                        <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3">💨</span>
                        {t('monitorWind')}
                      </li>
                      <li className="flex items-center">
                        <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3">📊</span>
                        {t('usePressure')}
                      </li>
                      <li className="flex items-center">
                        <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3">⏰</span>
                        {t('scheduleWork')}
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">{t('unableToLoadForecast')}</p>
                  <button
                    onClick={fetchWeatherForecast}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {t('tryAgain')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;