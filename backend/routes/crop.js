const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get the ML API URL from environment variables, with a fallback for local development
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000/recommend';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // Store your key in an environment variable

// Crop recommendation endpoint
router.post('/', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    // Handle both old and new payload formats
    let N, P, K, temperature, humidity, ph, rainfall;
    
    // Check if it's the new format (ML-ready)
    if (req.body.N !== undefined) {
      ({ N, P, K, temperature, humidity, ph, rainfall } = req.body);
      console.log('Using new format:', { N, P, K, temperature, humidity, ph, rainfall });
    } else {
      // Handle old format for backward compatibility
      const { soil_type, ph: inputPh, temperature: inputTemp, rainfall: inputRainfall, lat, lon } = req.body;
      
      // Map soil_type to NPK values
      const getNPK = (soilType) => {
        const npkMap = {
          clay: { N: 40, P: 20, K: 30 },
          loamy: { N: 50, P: 25, K: 35 },
          sandy: { N: 30, P: 15, K: 25 },
          silt: { N: 45, P: 22, K: 32 }
        };
        return npkMap[soilType] || { N: 40, P: 20, K: 30 };
      };
      
      ({ N, P, K } = getNPK(soil_type));
      temperature = inputTemp;
      ph = inputPh;
      rainfall = inputRainfall;
      humidity = 60; // default
      
      console.log('Using old format, converted to:', { N, P, K, temperature, humidity, ph, rainfall });
    }

    if (!N || !P || !K || !temperature || !humidity || !ph || !rainfall) {
      return res.status(400).json({ 
        error: 'Missing required fields for ML prediction' 
      });
    }

    // Always use mock response for deployed version (ML API not deployed)
    const crops = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee'];
    
    // Smart selection based on NPK values
    let recommended_crop;
    if (N > 80) recommended_crop = 'rice';
    else if (P > 40) recommended_crop = 'banana';
    else if (K > 40) recommended_crop = 'cotton';
    else if (temperature > 25) recommended_crop = 'maize';
    else if (ph < 6) recommended_crop = 'chickpea';
    else recommended_crop = crops[Math.floor(Math.random() * crops.length)];
    
    console.log('Returning recommendation:', recommended_crop);
    res.json({ recommended_crop });

  } catch (error) {
    console.error('Crop recommendation error:', error.response?.data || error.message);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    
    let errorMessage = 'Failed to get crop recommendation';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'ML API is not running on port 8000';
    } else if (error.code === 'TIMEOUT') {
      errorMessage = 'ML API request timed out';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;