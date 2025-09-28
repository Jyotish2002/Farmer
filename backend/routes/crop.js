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
    // Frontend now sends the ML-ready format directly
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

    if (!N || !P || !K || !temperature || !humidity || !ph || !rainfall) {
      return res.status(400).json({ 
        error: 'Missing required fields: N, P, K, temperature, humidity, ph, rainfall' 
      });
    }

    // Call the Python ML API directly with the data from frontend
    console.log('Calling ML API with data:', { N, P, K, temperature, humidity, ph, rainfall });
    
    const mlResponse = await axios.post(ML_API_URL, {
      N,
      P,
      K,
      temperature,
      humidity,
      ph,
      rainfall
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('ML API response:', mlResponse.data);
    const recommended_crop = mlResponse.data.recommended_crop;

    // Send response back to frontend
    res.json({
      recommended_crop: recommended_crop
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
    
    res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;