const express = require('express');
const axios = require('axios');
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Pest detection endpoint
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');

    // Prepare Gemini API request
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `Analyze this crop/plant image and identify any pests, diseases, or health issues. Provide:
1. Pest/Disease name (if any)
2. Cause of the problem
3. Treatment recommendations
4. Prevention tips
5. Severity level (low/medium/high)

If the plant appears healthy, state that clearly. Be specific and provide actionable advice for farmers.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: imageBase64
              }
            }
          ]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const analysis = response.data.candidates[0].content.parts[0].text;

    // Parse the response (this is a simple parsing, you might want to improve this)
    const result = {
      analysis: analysis,
      image_processed: true,
      timestamp: new Date().toISOString()
    };

    res.json(result);
  } catch (error) {
    console.error('Pest detection error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

module.exports = router;