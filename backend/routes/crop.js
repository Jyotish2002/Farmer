const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get the ML API URL from environment variables, with a fallback for local development
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000/recommend';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // Store your key in an environment variable

// Crop recommendation endpoint
router.post('/', verifyToken, async (req, res) => {
  try {
    // 1. Get minimal input from the user/frontend
    const { soil_type, lat, lon } = req.body;

    if (!soil_type || !lat || !lon) {
      return res.status(400).json({ error: 'Missing required fields: soil_type, lat, lon' });
    }

    // 2. Server fetches the weather data
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const weatherResponse = await axios.get(weatherApiUrl);
    
    const temperature = weatherResponse.data.main.temp;
    const humidity = weatherResponse.data.main.humidity;
    const rainfall = weatherResponse.data.rain ? weatherResponse.data.rain['1h'] : 0; // Handle missing rain data

    // 3. Call the Python ML API with ALL required data
    const mlResponse = await axios.post(ML_API_URL, {
      soil_type,
      temperature,
      humidity,
      rainfall,
    });

    // 4. Send a rich response back to the frontend
    res.json({
      recommended_crop: mlResponse.data.recommended_crop,
      // You can add these to your Python API later
      // confidence: mlResponse.data.confidence, 
      // alternatives: mlResponse.data.alternatives || []
    });

  } catch (error) {
    console.error('Crop recommendation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get crop recommendation' });
  }
});

module.exports = router;