const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const languageProfiles = {
  ml: {
    name: 'Malayalam',
    locale: 'ml-IN',
    fallback: 'ക്ഷമിക്കണം, ഇപ്പോൾ AI സേവനം ലഭ്യമല്ല. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക.',
    instruction: `You must converse entirely in Malayalam (മലയാളം). Use Malayalam script, agricultural terminology, and natural sentence structure. Avoid transliteration unless specifically requested.

Example conversation:
Q: വേനലിൽ ഏറ്റവും നല്ല വിള ഏതാണ്?
A: വേനൽക്കാലത്ത് ചുരുങ്ങിയ വെള്ളം മതിയാകുന്ന വിളകൾ മികച്ചതാണ്. ചോളം, ചെറുപയർ, വെണ്ടയ്ക്ക തുടങ്ങിയവ നല്ല തിരഞ്ഞെടുപ്പുകളാണ്. നനവ് നിലനിർത്താൻ മൾച്ചിംഗും പ്രാദേശിക മാതൃകകൾക്കും പ്രാധാന്യം നൽകണം.`
  },
  hi: {
    name: 'Hindi',
    locale: 'hi-IN',
    fallback: 'क्षमा करें, अभी AI सेवा उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।',
    instruction: `You must reply only in Hindi (हिंदी) using Devanagari script with precise agricultural terminology.

उदाहरण:
प्रश्न: गर्मियों में सबसे अच्छा फसल कौन सा है?
उत्तर: गर्मियों में कम पानी की ज़रूरत वाली फसलें उत्तम होती हैं, जैसे बाजरा, मूंग और भिंडी। मिट्टी की नमी बचाने के लिए मल्चिंग करना भी लाभदायक है।`
  }
};

// Chatbot endpoint
router.post('/', verifyToken, async (req, res) => {
  try {
    const { message, context, detectedLanguage } = req.body;
    console.log('Chatbot incoming:', { message: message?.slice(0,200), context, detectedLanguage });
    if (process.env.CHATBOT_DEBUG === '1') {
      try {
        console.log('Full chatbot request body:', JSON.stringify(req.body));
      } catch (e) {
        console.log('Could not stringify chatbot body for logging.');
      }
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const languageKey = detectedLanguage?.split('-')?.[0]?.toLowerCase();
    const profile = languageProfiles[languageKey] || null;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL; // e.g. 'models/text-bison-001' or 'models/chat-bison-001'
    if (!geminiApiKey) {
      // If the user typed in a local language (e.g., Malayalam), provide a helpful localized fallback
      const fallbackReply = profile?.fallback || 'Sorry, the AI assistant is not configured on this server. Please try again later.';
      console.warn('GEMINI_API_KEY missing; returning fallback reply');
      return res.status(503).json({ reply: fallbackReply });
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

Current context: ${context || 'General farming inquiry'}

${profile ? profile.instruction : 'Respond in English using clear, empathetic language suited for farmers.'}`;

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
      modelsToTry = availableModels.length > 0 ? availableModels.filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name) : ['models/gemini-1.5-pro','models/gemini-1.5-flash','models/gemini-2.0-flash-exp'];
    }

    console.log('Models to try:', modelsToTry);
    let response;
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${geminiApiKey}`;
        console.log('Calling Gemini model:', modelName, 'url:', url);
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
        console.log('Gemini response candidates:', response.data?.candidates?.length || 0);
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
      reply,
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