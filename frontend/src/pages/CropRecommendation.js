import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sprout, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const CropRecommendation = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    soilPh: '',
    temperature: '',
    rainfall: ''
  });
  const [selectedSoil, setSelectedSoil] = useState(null);
  const [coords, setCoords] = useState(null);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const navigate = useNavigate();
  const [lastGeoError, setLastGeoError] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // soil types the farmer can select instead of entering pH manually
  const soilTypes = [
    { id: 'clay', key: 'soil_clay', ph: 6.2, img: '/images/soil/clay_soil.jpg' },
    { id: 'loamy', key: 'soil_loamy', ph: 6.8, img: '/images/soil/loamy_soil.jpg' },
    { id: 'sandy', key: 'soil_sandy', ph: 5.8, img: '/images/soil/sandy_soil.jpg' },
    { id: 'silt', key: 'soil_silt', ph: 6.5, img: '/images/soil/silt_soil.jpg' }
  ];

  const handleSelectSoil = (soil) => {
    setSelectedSoil(soil.id);
    // set soilPh to the representative value (user can still edit)
    setFormData(prev => ({ ...prev, soilPh: soil.ph }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.soilPh || !formData.temperature || !formData.rainfall) {
      toast.error(t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      // include location if available
      const payload = {
        ...formData,
        ...(coords ? { lat: coords.lat, lon: coords.lon } : {})
      };
      const response = await axios.post('/api/crop-recommendation', payload);
      setRecommendation(response.data);
      toast.success(t('recommendationGenerated') || 'Crop recommendation generated!');
    } catch (error) {
      console.error('Crop recommendation error:', error);
      toast.error(t('failedToGetRecommendation') || 'Failed to get crop recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather for given coordinates and try to populate temperature and rainfall
  const fetchWeatherForCoords = async (lat, lon) => {
    setFetchingWeather(true);
    setWeatherError(null);
    try {
      const weatherResp = await axios.get('/api/weather', { params: { lat, lon } });
      const w = weatherResp.data;
      // temperature: try to read expected shape
      const temp = w?.temperature?.current ?? w?.main?.temp ?? null;

      // rainfall: try common properties or fallback to forecast aggregation
      let rainVal = null;
      if (w?.rain) {
        // openweather style: rain: { '1h': x, '3h': y }
        if (typeof w.rain === 'number') rainVal = w.rain;
        else if (w.rain['1h']) rainVal = w.rain['1h'];
        else if (w.rain['3h']) rainVal = w.rain['3h'];
      }

      // if rainfall not in current weather, try forecast endpoint and sum next 3 days
      if (rainVal == null) {
        try {
          const fResp = await axios.get('/api/weather/forecast', { params: { lat, lon } });
          const forecast = fResp.data.forecast || [];
          // sum up rain amounts where available (fallback)
          const sum = forecast.slice(0, 3).reduce((acc, day) => acc + (day.rain?.amount || 0), 0);
          rainVal = sum || 0;
        } catch (err) {
          rainVal = 0;
        }
      }

      setFormData(prev => ({
        ...prev,
        temperature: temp != null ? Math.round(temp * 10) / 10 : prev.temperature,
        rainfall: rainVal != null ? Math.round(rainVal * 10) / 10 : prev.rainfall
      }));
    } catch (err) {
      console.error('Failed to fetch weather for coords', err);
      const resp = err?.response?.data || {};
      const msg = resp.error || resp.message || err?.message || 'Unknown error';
      if (err?.response?.status === 401) {
        setWeatherError('Authentication required: please log in to autofill weather');
        toast.error('Please log in to autofill weather');
      } else {
        setWeatherError(msg);
        toast.error(`Unable to auto-fill weather: ${msg}`);
      }
    } finally {
      setFetchingWeather(false);
    }
  };

  // on mount, try to auto-detect location and fill weather fields
  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setAccuracy(pos.coords.accuracy);
        setLastGeoError(null);
        fetchWeatherForCoords(lat, lon);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable', err);
        const msg = err?.code === 1 ? 'Permission denied' : err?.code === 2 ? 'Position unavailable' : err?.code === 3 ? 'Timeout' : 'Geolocation error';
        setLastGeoError(`${msg}${err?.message ? `: ${err.message}` : ''}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator?.geolocation) {
      toast.error('Geolocation not available');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setAccuracy(pos.coords.accuracy);
        fetchWeatherForCoords(lat, lon);
        toast.success('Location updated');
      },
      (err) => {
        console.warn('Geolocation error', err);
        const msg = err?.code === 1 ? 'Permission denied' : err?.code === 2 ? 'Position unavailable' : err?.code === 3 ? 'Timeout' : 'Geolocation error';
        const friendly = `${msg}${err?.message ? `: ${err.message}` : ''}`;
        setLastGeoError(friendly);
        toast.error(`Unable to get current location — ${friendly}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 bottom-safe-area app-scroll pt-14">
      <div className="px-4 py-6 pb-16">
        <div className="text-center mb-8">
          <Sprout className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">{t('cropRecommendation')}</h2>
          <p className="text-gray-600 mt-2">
            {t('aiCropRecommendationDesc') || 'Get AI-powered crop recommendations based on your soil and weather conditions'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 card-touch">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('soilType') || 'Soil type'}</label>
              <div className="grid grid-cols-2 gap-3">
                {soilTypes.map(soil => (
                  <button
                    key={soil.id}
                    type="button"
                    onClick={() => handleSelectSoil(soil)}
                    className={`flex flex-col items-center p-2 border rounded-lg focus:outline-none ${selectedSoil === soil.id ? 'border-green-600 ring-2 ring-green-100' : 'border-gray-200'}`}
                  >
                    <img src={soil.img} alt={t(`${soil.key}_label`)} className="h-24 w-full object-cover rounded-md mb-2" />
                    <div className="text-sm font-medium text-gray-800">{t(`${soil.key}_label`)}</div>
                  </button>
                ))}
              </div>
              {selectedSoil && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                  {t(`${soilTypes.find(s => s.id === selectedSoil)?.key}_desc`)}
                </div>
              )}

              <label htmlFor="soilPh" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                {t('soilPh')}
              </label>
              <input
                type="number"
                id="soilPh"
                name="soilPh"
                step="0.1"
                min="0"
                max="14"
                value={formData.soilPh}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('enterSoilPh') || 'Enter soil pH (0-14)'}
                required
              />
            </div>

            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                {t('temperatureInput')}
              </label>
              <div className="relative">
              <input
                type="number"
                id="temperature"
                name="temperature"
                step="0.1"
                value={formData.temperature}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('enterTemperature') || 'Enter temperature in Celsius'}
                required
              />
              {fetchingWeather && (
                <div className="absolute right-3 top-3">
                  <Loader className="animate-spin h-5 w-5 text-gray-500" />
                </div>
              )}
              </div>
            </div>

            <div>
              <label htmlFor="rainfall" className="block text-sm font-medium text-gray-700 mb-2">
                {t('rainfallInput')}
              </label>
              <input
                type="number"
                id="rainfall"
                name="rainfall"
                min="0"
                value={formData.rainfall}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('enterRainfall') || 'Enter annual rainfall in mm'}
                required
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-md border border-green-100 hover:bg-green-100"
                >
                  {t('useCurrentLocation') || 'Use current location'}
                </button>
                <div className="text-xs text-gray-500">
                  {accuracy != null ? `Accuracy: ~${Math.round(accuracy)}m` : ''}
                </div>
              </div>
              {lastGeoError && (
                <div className="mt-2 text-sm text-red-600">{lastGeoError}</div>
              )}
              {weatherError && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-red-600">{`Weather fetch failed: ${weatherError}`}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => coords && fetchWeatherForCoords(coords.lat, coords.lon)}
                        disabled={!coords || fetchingWeather}
                        className="text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100 hover:bg-blue-100 disabled:opacity-50"
                      >
                        Retry
                      </button>
                      {weatherError && weatherError.toLowerCase().includes('auth') && (
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="text-sm text-white bg-green-600 px-3 py-1 rounded-md border border-green-600 hover:bg-green-700"
                        >
                          Login
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || fetchingWeather}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {t('analyzing')}
                </>
              ) : (
                t('getRecommendation')
              )}
            </button>
          </form>

          {recommendation && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {t('recommendedCrop')}: {recommendation.recommended_crop}
              </h3>
              <p className="text-green-700">
                {t('confidence')}: {Math.round(recommendation.confidence * 100)}%
              </p>
              {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-green-600 font-medium">{t('alternativeCrops') || 'Alternative crops'}:</p>
                  <ul className="list-disc list-inside text-sm text-green-600 mt-1">
                    {recommendation.alternatives.map((alt, index) => (
                      <li key={index}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;