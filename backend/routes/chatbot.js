const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Chatbot endpoint
router.post('/', verifyToken, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Create context-aware prompt for agricultural advice
    const systemPrompt = `You are an AI agricultural assistant helping farmers with expert advice on farming, crops, pest management, soil health, weather impact, and sustainable farming practices. Provide practical, actionable advice based on agricultural best practices.

Key guidelines:
- Be helpful, accurate, and encouraging
- Provide specific, actionable recommendations
- Consider local farming conditions when possible
- Suggest sustainable and eco-friendly practices
- If unsure about something, recommend consulting local agricultural experts
- Keep responses concise but informative

Current context: ${context || 'General farming inquiry'}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nFarmer's question: ${message}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;

    res.json({
      reply: reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get response from chatbot' });
  }
});

// Get chat history (placeholder - would need a Chat model for persistence)
router.get('/history', verifyToken, async (req, res) => {
  // This would typically fetch from a database
  res.json({
    history: [],
    message: 'Chat history feature coming soon'
  });
});

module.exports = router;