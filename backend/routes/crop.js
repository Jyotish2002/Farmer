const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const REQUIRED_FIELDS = ['N','P','K','temperature','humidity','ph','rainfall'];

const getMockRecommendation = ({ N, P, K, temperature, humidity, ph, rainfall }) => {
  // Simple heuristic-based fallback when ML API is unavailable
  // These rules are intentionally deterministic so repeated requests yield the same result
  if (ph < 6 && rainfall > 150) {
    return {
      recommended_crop: 'rice',
      reason: 'High rainfall and slightly acidic soil favour paddy cultivation.',
    };
  }

  if (temperature >= 30 && humidity < 50) {
    return {
      recommended_crop: 'cotton',
      reason: 'Hot, relatively dry conditions with moderate nutrients suit cotton.',
    };
  }

  if (temperature >= 20 && temperature <= 28 && rainfall >= 50 && rainfall <= 120) {
    return {
      recommended_crop: 'maize',
      reason: 'Balanced temperature and rainfall range is ideal for maize.',
    };
  }

  if (temperature < 18) {
    return {
      recommended_crop: 'wheat',
      reason: 'Cooler climates support rabi crops like wheat.',
    };
  }

  return {
    recommended_crop: 'groundnut',
    reason: 'Default fallback crop chosen for moderate climates.',
  };
};

// Get the ML API URL from environment variables, with a fallback for local development
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000/recommend';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // Store your key in an environment variable

// Crop recommendation endpoint
router.post('/', async (req, res) => {
  // Declare variables outside try block so they're accessible in catch block
  let N, P, K, temperature, humidity, ph, rainfall;
  
  try {
    console.log('Received request body:', req.body);
    
    // Handle both old and new payload formats
    
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

    const coerceNumber = (value) => {
      if (value === '' || value === null || value === undefined) return value;
      const num = Number(value);
      return Number.isNaN(num) ? value : num;
    };

    N = coerceNumber(N);
    P = coerceNumber(P);
    K = coerceNumber(K);
    temperature = coerceNumber(temperature);
    humidity = coerceNumber(humidity);
    ph = coerceNumber(ph);
    rainfall = coerceNumber(rainfall);

  const payload = { N, P, K, temperature, humidity, ph, rainfall };
  const missingFields = REQUIRED_FIELDS.filter((key) => payload[key] === undefined || payload[key] === null || payload[key] === '' || Number.isNaN(payload[key]));
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields for ML prediction',
        missing: missingFields
      });
    }

    // Always use the local ML API running on port 8000
    console.log('Calling local ML API at:', ML_API_URL);
    console.log('Payload being sent to ML API:', payload);
    const mlResponse = await axios.post(ML_API_URL, payload, {
      timeout: 15000, // 15 second timeout for ML processing
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const recommended_crop = mlResponse.data.recommended_crop;
    console.log('✅ SUCCESS: Got real ML prediction from local API:', recommended_crop);
    
    console.log('Returning recommendation:', recommended_crop);
    res.json({ 
      recommended_crop,
      isRealML: true,
      source: 'real_ml'
    });

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
    
    // Fallback to mock recommendation so the UI still receives a response
    const mock = getMockRecommendation({ N, P, K, temperature, humidity, ph, rainfall });
    console.log('ℹ️ Using mock crop recommendation due to ML failure:', mock);

    res.status(200).json({
      recommended_crop: mock.recommended_crop,
      reason: mock.reason,
      isRealML: false,
      source: 'mock_fallback',
      error: errorMessage
    });
  }
});

module.exports = router;