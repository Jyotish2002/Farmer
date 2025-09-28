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
    // 1. Get input from the user/frontend
    const { soil_type, ph, temperature, rainfall, lat, lon } = req.body;

    if (!soil_type || !ph || !temperature || !rainfall) {
      return res.status(400).json({ error: 'Missing required fields: soil_type, ph, temperature, rainfall' });
    }

    // 2. Map soil_type to typical NPK values
    const getNPK = (soilType) => {
      const npkMap = {
        clay: { N: 40, P: 20, K: 30 },
        loamy: { N: 50, P: 25, K: 35 },
        sandy: { N: 30, P: 15, K: 25 },
        silt: { N: 45, P: 22, K: 32 }
      };
      return npkMap[soilType] || { N: 40, P: 20, K: 30 }; // default to clay
    };

    const { N, P, K } = getNPK(soil_type);

    // 3. Fetch weather data for humidity if lat/lon provided
    let humidity = 60; // default humidity
    if (lat && lon && WEATHER_API_KEY) {
      try {
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
        const weatherResponse = await axios.get(weatherApiUrl);
        humidity = weatherResponse.data.main.humidity;
      } catch (weatherError) {
        console.warn('Failed to fetch humidity, using default:', weatherError.message);
      }
    }

    // 4. Call the Python ML API with ALL required data
    const mlResponse = await axios.post(ML_API_URL, {
      N,
      P,
      K,
      temperature,
      humidity,
      ph,
      rainfall
    });

    // 5. Send response back to frontend
    res.json({
      recommended_crop: mlResponse.data.recommended_crop
    });

  } catch (error) {
    console.error('Crop recommendation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get crop recommendation' });
  }
});

module.exports = router;