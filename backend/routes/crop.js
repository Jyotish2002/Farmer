const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Crop recommendation endpoint
router.post('/', verifyToken, async (req, res) => {
  try {
    const { soilPh, temperature, rainfall } = req.body;

    // Validate input
    if (!soilPh || !temperature || !rainfall) {
      return res.status(400).json({
        error: 'Missing required fields: soilPh, temperature, rainfall'
      });
    }

    // Call ML API
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
    const response = await axios.post(`${mlApiUrl}/predict/crop`, {
      soil_ph: parseFloat(soilPh),
      temperature: parseFloat(temperature),
      rainfall: parseFloat(rainfall)
    });

    res.json({
      recommended_crop: response.data.recommended_crop,
      confidence: response.data.confidence,
      alternatives: response.data.alternatives || []
    });
  } catch (error) {
    console.error('Crop recommendation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get crop recommendation' });
  }
});

module.exports = router;