import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Bot,
  ArrowLeft,
  Send,
  RefreshCw,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const isDemoMode = token === 'demo-jwt-token-123';

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || loading) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setLoading(true);

    // Add user message to history
    setChatHistory(prev => [...prev, { 
      type: 'user', 
      message: userMessage,
      timestamp: new Date()
    }]);

    // Show typing indicator
    setIsTyping(true);

    try {
      let botResponse;
      
      if (isDemoMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Enhanced demo chatbot responses based on message content
        const message = userMessage.toLowerCase();
        
        if (message.includes('weather') || message.includes('rain') || message.includes('climate')) {
          botResponse = "Based on current weather data, I can see clear skies with 28°C temperature. The next few days look favorable for farming activities. There's a 30% chance of rain in 2 days, which would be good for your crops. Would you like detailed weather forecasts?";
        } else if (message.includes('crop') || message.includes('plant') || message.includes('grow')) {
          botResponse = "For this season and your region, I recommend considering crops like tomatoes, okra, or leafy greens. These crops do well in current weather conditions. What type of crops are you currently growing or planning to grow?";
        } else if (message.includes('soil') || message.includes('fertilizer') || message.includes('nutrient')) {
          botResponse = "Soil health is crucial for good yields! I recommend getting a soil pH test done. Generally, adding organic compost and maintaining proper drainage helps. For specific fertilizer recommendations, I'd need to know your crop type and current soil condition.";
        } else if (message.includes('pest') || message.includes('disease') || message.includes('insect')) {
          botResponse = "Pest management is important for healthy crops. Common preventive measures include: regular field inspection, crop rotation, and using neem-based organic pesticides. If you notice specific symptoms, you can use our pest detection feature for accurate identification.";
        } else if (message.includes('yield') || message.includes('harvest') || message.includes('production')) {
          botResponse = "To improve yield, focus on: proper spacing, timely irrigation, balanced nutrition, and pest control. The optimal harvest time depends on your crop type. Our yield prediction tool can help estimate expected production based on current conditions.";
        } else if (message.includes('water') || message.includes('irrigation') || message.includes('moisture')) {
          botResponse = "Water management is key! With current weather conditions, morning irrigation is most effective. Check soil moisture at 2-3 inch depth. Drip irrigation can save 30-50% water compared to flood irrigation. How do you currently manage irrigation?";
        } else if (message.includes('subsidy') || message.includes('scheme') || message.includes('government')) {
          botResponse = "There are several government schemes available for farmers. Currently, there's a new organic fertilizer subsidy scheme. I recommend checking the government advisories section for latest updates. Would you like help with specific scheme applications?";
        } else if (message.includes('price') || message.includes('market') || message.includes('sell')) {
          botResponse = "Market prices fluctuate based on supply and demand. I suggest checking local mandi prices regularly. Consider value addition through processing or direct marketing to consumers for better prices. What crops are you planning to sell?";
        } else {
          const generalResponses = [
            "I'm here to help with all your farming questions! You can ask me about weather, crops, soil health, pest management, or any farming practices.",
            "That's a great question! As your AI farming assistant, I can provide guidance on crop selection, weather planning, soil management, and sustainable farming practices.",
            "I'd be happy to help you with that! Feel free to ask specific questions about your crops, farming techniques, or any agricultural challenges you're facing.",
            "As your farming assistant, I can help with crop recommendations, weather analysis, pest identification, and farming best practices. What specific area would you like assistance with?",
          ];
          botResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        }
      } else {
        const response = await axios.post('/api/chatbot', {
          message: userMessage,
          context: 'farmer_chatbot_page',
          userId: user?.id
        });
        botResponse = response.data.reply;
      }

      // Remove typing indicator and add bot response
      setIsTyping(false);
      setChatHistory(prev => [...prev, {
        type: 'bot',
        message: botResponse,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      setChatHistory(prev => [...prev, {
        type: 'bot',
        message: t('chatbotErrorMessage') || 'Sorry, I\'m having trouble responding right now. Please try again later.',
        timestamp: new Date()
      }]);
      toast.error(t('chatbotError') || 'Chat error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setChatMessage(suggestion);
  };

  const clearChat = () => {
    setChatHistory([]);
    toast.success(t('chatCleared') || 'Chat cleared');
  };

  const quickSuggestions = [
    t('weatherToday') || "What's the weather like today?",
    t('cropRecommendations') || "What crops should I plant?",
    t('soilHealthTips') || "How can I improve soil health?",
    t('pestPrevention') || "How to prevent pest attacks?",
    t('irrigationAdvice') || "When should I water my crops?",
    t('marketPrices') || "What are current market prices?",
    t('governmentSchemes') || "Tell me about government schemes",
    t('harvestTiming') || "When is the best time to harvest?"
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={t('goBack') || 'Go Back'}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">{t('aiFarmAssistant') || 'AI Farm Assistant'}</h1>
                <p className="text-xs text-gray-500">{t('alwaysHereToHelp') || 'Always here to help'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={t('clearChat') || 'Clear Chat'}
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Bot className="h-12 w-12 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('welcomeToAIAssistant') || 'Welcome to AI Farm Assistant!'}
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                {t('aiAssistantDescription') || 'I\'m here to help you with farming advice, weather information, crop recommendations, and answer any agricultural questions you might have.'}
              </p>
              
              {/* Quick Suggestions Grid */}
              <div className="w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t('quickSuggestions') || 'Quick Suggestions'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickSuggestions.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                    >
                      <p className="text-sm font-medium text-gray-800">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start space-x-3 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl">
                    {chat.type === 'bot' && (
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-5 w-5 text-purple-600" />
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        chat.type === 'user'
                          ? 'bg-purple-600 text-white rounded-br-sm ml-auto'
                          : 'bg-white border shadow-sm rounded-bl-sm'
                      }`}
                    >
                      <p className={`text-sm leading-relaxed ${
                        chat.type === 'user' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {chat.message}
                      </p>
                      <p className={`text-xs mt-2 ${
                        chat.type === 'user' ? 'text-purple-100' : 'text-gray-400'
                      }`}>
                        {chat.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {chat.type === 'user' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="bg-white border shadow-sm rounded-lg rounded-bl-sm px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Quick Suggestions Bar (when chat has started) */}
        {chatHistory.length > 0 && (
          <div className="px-4 py-2 bg-white border-t">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex-shrink-0 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="bg-white border-t px-4 py-4">
          <form onSubmit={handleChatSubmit} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={t('typeYourQuestion') || 'Type your farming question here...'}
                rows="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-32"
                style={{ minHeight: '48px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit(e);
                  }
                }}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              className="w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              disabled={!chatMessage.trim() || loading}
              title={t('sendMessage') || 'Send Message'}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;