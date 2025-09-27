import React, { useState } from 'react';
import axios from 'axios';
import { TrendingUp, Loader, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const YieldPrediction = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    cropType: '',
    area: '',
    inputCost: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const cropTypes = [
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Potato',
    'Tomato', 'Onion', 'Soybean', 'Groundnut', 'Barley', 'Millet'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cropType || !formData.area || !formData.inputCost) {
      toast.error(t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/yield-prediction', formData);
      setPrediction(response.data);
      toast.success(t('yieldPredictionGenerated'));
    } catch (error) {
      console.error('Yield prediction error:', error);
      toast.error(t('failedToGetYieldPrediction'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 bottom-safe-area app-scroll pt-14">
      <div className="px-4 py-6 pb-16">
        <div className="text-center mb-8">
          <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">{t('yieldPrediction')}</h2>
          <p className="text-gray-600 mt-2">
            {t('yieldPredictionDesc')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 card-touch">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-2">
                {t('cropType')}
              </label>
              <select
                id="cropType"
                name="cropType"
                value={formData.cropType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">{t('selectCrop')}</option>
                {cropTypes.map((crop) => (
                  <option key={crop} value={crop}>
                    {t(crop.toLowerCase()) || crop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                {t('farmArea')}
              </label>
              <input
                type="number"
                id="area"
                name="area"
                step="0.1"
                min="0"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('enterFarmArea')}
                required
              />
            </div>

            <div>
              <label htmlFor="inputCost" className="block text-sm font-medium text-gray-700 mb-2">
                {t('inputCost')}
              </label>
              <input
                type="number"
                id="inputCost"
                name="inputCost"
                min="0"
                value={formData.inputCost}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('enterInputCost')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {t('predictingYield')}
                </>
              ) : (
                t('predictYieldProfit')
              )}
            </button>
          </form>

          {prediction && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-800">
                    {t('predictedYield')}
                  </h3>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {prediction.predicted_yield} {t('kg')}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {t('confidence')}: {Math.round(prediction.confidence * 100)}%
                </p>
              </div>

              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800">
                    {t('expectedProfit')}
                  </h3>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ₹{prediction.expected_profit.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {t('afterDeductingCosts')}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">💡 {t('tipsForBetterYield')}:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('useQualitySeeds')}</li>
              <li>• {t('followFertilizerSchedule')}</li>
              <li>• {t('monitorWeatherPests')}</li>
              <li>• {t('ensureIrrigationDrainage')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldPrediction;