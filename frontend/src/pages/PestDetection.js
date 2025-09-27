import React, { useState } from 'react';
import axios from 'axios';
import { Bug, Upload, Loader, Camera } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const PestDetection = () => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('selectImageFile'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(t('fileSizeLimit'));
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error(t('selectImageToAnalyze'));
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/pest-detection', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAnalysis(response.data);
      toast.success(t('imageAnalyzedSuccessfully'));
    } catch (error) {
      console.error('Pest detection error:', error);
      toast.error(t('failedToAnalyzeImage'));
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
    document.getElementById('imageInput').value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 bottom-safe-area app-scroll pt-14">
      <div className="px-4 py-6 pb-16">
        <div className="text-center mb-8">
          <Bug className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">{t('pestDetection')}</h2>
          <p className="text-gray-600 mt-2">
            {t('pestDetectionDesc')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 card-touch">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('uploadCropImage')}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full h-64 object-contain mx-auto rounded-lg"
                    />
                    <div className="flex justify-center space-x-4">
                      <button
                        type="button"
                        onClick={clearImage}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        {t('removeImage')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <label
                        htmlFor="imageInput"
                        className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {t('chooseImage')}
                      </label>
                      <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {t('supportedFormats')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedFile && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    {t('analyzingImage')}
                  </>
                ) : (
                  t('analyzeForPests')
                )}
              </button>
            )}
          </form>

          {analysis && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                {t('analysisResults')}
              </h3>
              <div className="prose prose-sm text-blue-900">
                <div className="whitespace-pre-wrap">{analysis.analysis}</div>
              </div>
              <div className="mt-4 text-xs text-blue-600">
                {t('analyzedOn')}: {new Date(analysis.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">📸 {t('tipsForBetterAnalysis')}:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• {t('takeClearPhotos')}</li>
              <li>• {t('includeCloseupViews')}</li>
              <li>• {t('avoidBlurryImages')}</li>
              <li>• {t('captureMultipleAngles')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestDetection;