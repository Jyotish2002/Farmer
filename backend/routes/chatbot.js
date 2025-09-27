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
    const geminiModel = process.env.GEMINI_MODEL; // e.g. 'models/text-bison-001' or 'models/chat-bison-001'
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

    // First, let's check what models are available
    let availableModels = [];
    try {
      const listResp = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${geminiApiKey}`);
      availableModels = (listResp.data && listResp.data.models) ? listResp.data.models : [];
      console.log('Available Gemini models:', availableModels.map(m => m.name));
    } catch (listErr) {
      console.warn('Could not list models:', listErr.response?.data || listErr.message);
    }

    // Build endpoint: prefer configured GEMINI_MODEL when it's available
    let modelsToTry = [];
    if (geminiModel) {
      // If we could list models, check it's available
      const found = availableModels.find(m => m.name === geminiModel);
      if (found) {
        modelsToTry = [geminiModel];
      } else {
        console.warn(`GEMINI_MODEL (${geminiModel}) not found in ListModels. Falling back to available models.`);
        modelsToTry = availableModels.length > 0 ? availableModels.filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name) : ['models/gemini-2.5-flash','models/gemini-2.5-pro','models/gemini-2.0-flash'];
      }
    } else {
      modelsToTry = availableModels.length > 0 ? availableModels.filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name) : ['models/gemini-2.5-flash','models/gemini-2.5-pro','models/gemini-2.0-flash'];
    }

    console.log('Models to try:', modelsToTry);
    let response;
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${geminiApiKey}`;
        response = await axios.post(
          url,
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
        break; // Success, exit loop
      } catch (err) {
        lastError = err;
        const apiError = err.response?.data;
        if (apiError && apiError.status === 'NOT_FOUND') {
          console.warn(`Model ${modelName} not found, trying next...`);
          continue; // Try next model
        } else {
          // Other error (rate limit, auth, etc.), don't try other models
          throw err;
        }
      }
    }

    // If all models failed, return helpful error
    if (!response && lastError) {
      const apiError = lastError.response?.data;
      console.error('All Gemini models failed. Available models:', availableModels.map(m => m.name));
      return res.status(502).json({
        error: 'No supported Gemini model found.',
        suggestion: 'Check available models and set GEMINI_MODEL to a supported one. Tried: ' + modelsToTry.join(', '),
        availableModels: availableModels.map(m => ({ 
          name: m.name, 
          supportedMethods: m.supportedGenerationMethods || [] 
        })),
        triedModels: modelsToTry,
        lastError: apiError
      });
    }

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

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