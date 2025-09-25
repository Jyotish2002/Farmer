import React, { useState } from 'react';
import axios from 'axios';
import { Sprout, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const CropRecommendation = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    soilPh: '',
    temperature: '',
    rainfall: ''
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.soilPh || !formData.temperature || !formData.rainfall) {
      toast.error(t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/crop-recommendation', formData);
      setRecommendation(response.data);
      toast.success(t('recommendationGenerated') || 'Crop recommendation generated!');
    } catch (error) {
      console.error('Crop recommendation error:', error);
      toast.error(t('failedToGetRecommendation') || 'Failed to get crop recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={t('goBack')}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{t('cropRecommendation')}</h1>
          <div className="w-9"></div>
        </div>
      </div>

      <div className="text-center mb-8 mt-6 px-4">
        <Sprout className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">{t('cropRecommendation')}</h2>
        <p className="text-gray-600 mt-2">
          {t('aiCropRecommendationDesc') || 'Get AI-powered crop recommendations based on your soil and weather conditions'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mx-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="soilPh" className="block text-sm font-medium text-gray-700 mb-2">
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
          </div>

          <button
            type="submit"
            disabled={loading}
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
  );
};

export default CropRecommendation;