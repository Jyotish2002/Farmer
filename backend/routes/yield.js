const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Yield prediction endpoint
router.post('/', verifyToken, async (req, res) => {
  try {
    const { cropType, area, inputCost } = req.body;

    // Validate input
    if (!cropType || !area || !inputCost) {
      return res.status(400).json({
        error: 'Missing required fields: cropType, area, inputCost'
      });
    }

    // Call ML API
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
    const response = await axios.post(`${mlApiUrl}/predict/yield`, {
      crop_type: cropType,
      area: parseFloat(area),
      input_cost: parseFloat(inputCost)
    });

    res.json({
      predicted_yield: response.data.predicted_yield,
      expected_profit: response.data.expected_profit,
      confidence: response.data.confidence
    });
  } catch (error) {
    console.error('Yield prediction error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to predict yield' });
  }
});

module.exports = router;