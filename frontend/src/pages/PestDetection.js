import React, { useState, useRef, useEffect } from 'react';
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
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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

  // clear selected image / preview / analysis
  const clearImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = t('cameraNotSupported');
      setCameraError(msg);
      toast.error(msg);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.muted = true; // allow autoplay on mobile
        videoRef.current.srcObject = stream;
        // try to play explicitly (some browsers need this after srcObject set)
        try { await videoRef.current.play(); } catch (_) { /* ignore */ }
      }
      setCameraOn(true);
      setCameraError(null);
    } catch (err) {
      console.error('Camera error', err);
      // run quick diagnostic
      let detail = '';
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const camDevices = devices.filter(d => d.kind === 'videoinput');
        detail = ` Devices found: ${camDevices.length}`;
      } catch (diagErr) {
        detail = 'Device enumeration failed';
      }
      const msg = err && err.name === 'NotAllowedError' ? t('cameraPermissionDenied') : `${t('cameraNotSupported')} (${detail})`;
      setCameraError(msg);
      toast.error(msg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  // stop camera on unmount to release device
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      const url = URL.createObjectURL(blob);
      setPreview(url);
      // stop camera automatically after capture
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const tryCameraAgain = () => {
    setCameraError(null);
    startCamera();
  };

  const useUploadFallback = () => {
    setCameraError(null);
    // ensure camera is stopped and show upload UI (we already show upload when not cameraOn)
    stopCamera();
    toast('Switched to image upload.');
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
                    <div className="w-full flex justify-center">
                      {cameraOn ? (
                        <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-md" />
                      ) : (
                        <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                      )}
                    </div>

                    {cameraError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                        <div className="font-semibold">{t('camera_help_title')}</div>
                        <div className="mt-1">{t('camera_help_text')}</div>
                        <div className="mt-3 flex space-x-2">
                          <button onClick={tryCameraAgain} type="button" className="px-3 py-1 bg-white border border-red-200 rounded-md text-red-700">{t('camera_try_again')}</button>
                          <button onClick={useUploadFallback} type="button" className="px-3 py-1 bg-red-600 text-white rounded-md">{t('camera_fallback_upload')}</button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center space-x-3">
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

                      {!cameraOn ? (
                        <button type="button" onClick={startCamera} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                          {t('useCamera')}
                        </button>
                      ) : (
                        <>
                          <button type="button" onClick={captureFromCamera} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {t('capturePhoto')}
                          </button>
                          <button type="button" onClick={stopCamera} className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            {t('stopCamera')}
                          </button>
                        </>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 text-center">
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