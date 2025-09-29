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
  User,
  Mic,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { user, token } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isExpertOpen, setIsExpertOpen] = useState(false);
  const [expertQuery, setExpertQuery] = useState('');
  const [isExpertRecording, setIsExpertRecording] = useState(false);
  const expertRecognitionRef = useRef(null);
  const [detectedLanguage, setDetectedLanguage] = useState('auto');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const isDemoMode = token === 'demo-jwt-token-123';
  const handleChatSubmitRef = useRef();

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  useEffect(() => {
    // Initialize SpeechRecognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('')
        .trim();
      if (transcript) {
        // detect language and set
        const lang = detectLanguageFromText(transcript);
        setDetectedLanguage(lang || 'auto');
        setChatMessage(transcript);
        // Auto-submit the transcribed message via handler ref, pass transcript override
        setTimeout(() => {
          if (handleChatSubmitRef.current) handleChatSubmitRef.current({ preventDefault: () => {} }, transcript);
        }, 250);
      }
    };

    recognition.onerror = (err) => {
      console.warn('Speech recognition error', err);
      toast.error(t('speechRecognitionError') || 'Speech recognition failed');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    // Expert modal separate recognition (so user can record expert question independently)
    const expertRec = new SpeechRecognition();
    expertRec.lang = 'en-US';
    expertRec.interimResults = false;
    expertRec.maxAlternatives = 1;
    expertRec.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('').trim();
      if (transcript) setExpertQuery(transcript);
    };
    expertRec.onerror = (err) => {
      console.warn('Expert recognition error', err);
      toast.error(t('speechRecognitionError') || 'Speech recognition failed');
      setIsExpertRecording(false);
    };
    expertRec.onend = () => setIsExpertRecording(false);
    expertRecognitionRef.current = expertRec;

    return () => {
      try { recognition.stop(); } catch(e) {}
      recognitionRef.current = null;
      try { expertRec.stop(); } catch(e) {}
      expertRecognitionRef.current = null;
    };
  }, [t]);

  // Basic script-based language detection heuristic
  const detectLanguageFromText = (text) => {
    if (!text) return 'en';
  // Devanagari (Hindi, Marathi, Nepali) U+0900 - U+097F
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
  // Bengali U+0980 - U+09FF
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
  // Malayalam U+0D00 - U+0D7F
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  // Tamil U+0B80 - U+0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  // Telugu U+0C00 - U+0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  // Kannada U+0C80 - U+0CFF
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
    // Fallback to English
    return 'en-US';
  };

  // Start/Stop recognition
  const startRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      toast.error(t('speechNotSupported') || 'Speech recognition not supported in this browser.');
      return;
    }
    try {
      recognition.lang = 'en-US'; // default; actual detection happens after transcript
      recognition.start();
      setIsRecording(true);
    } catch (e) {
      console.warn('startRecording failed', e);
      toast.error(t('speechStartError') || 'Could not start recording');
    }
  };

  const stopRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
      setIsRecording(false);
    } catch (e) {
      console.warn('stopRecording failed', e);
    }
  };

  const startExpertRecording = () => {
    const rec = expertRecognitionRef.current;
    if (!rec) {
      toast.error(t('speechNotSupported') || 'Speech recognition not supported in this browser.');
      return;
    }
    try {
      rec.lang = 'en-US';
      rec.start();
      setIsExpertRecording(true);
    } catch (e) {
      console.warn('startExpertRecording failed', e);
      toast.error(t('speechStartError') || 'Could not start recording');
    }
  };

  const stopExpertRecording = () => {
    const rec = expertRecognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
      setIsExpertRecording(false);
    } catch (e) {
      console.warn('stopExpertRecording failed', e);
    }
  };

  

  const toggleSpeak = (index, text, lang = 'en-US') => {
    // If currently speaking this message, stop
    if (speakingIndex === index) {
      try { synthRef.current.cancel(); } catch(e) {}
      setSpeakingIndex(null);
      return;
    }

    // Stop any existing speech and start new
    try { synthRef.current.cancel(); } catch(e) {}
    setSpeakingIndex(index);
    // create utterance and speak (use same logic as speakText but keep control here)
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    const voices = synthRef.current.getVoices();
    const match = voices.find(v => v.lang && v.lang.startsWith(lang.split('-')[0]));
    if (match) utter.voice = match;
    utter.onend = () => setSpeakingIndex(null);
    utter.onerror = () => setSpeakingIndex(null);
    synthRef.current.speak(utter);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
      // we intentionally leave dependencies empty; handler is invoked via ref

  const handleChatSubmit = React.useCallback(async (e, overrideMessage) => {
    e.preventDefault();
    const messageToSend = (overrideMessage && overrideMessage.trim()) ? overrideMessage.trim() : chatMessage.trim();
    if (!messageToSend || loading) return;

    const userMessage = messageToSend;
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
        
        // Enhanced demo chatbot responses based on message content and selected language
        const message = userMessage.toLowerCase();
        const isMalayalamSelected = currentLanguage === 'malayalam';
        
        if (isMalayalamSelected) {
          // Malayalam demo responses
          if (message.includes('weather') || message.includes('rain') || message.includes('climate') || 
              message.includes('കാലാവസ്ഥ') || message.includes('മഴ') || message.includes('മഴക്കാലം')) {
            botResponse = "നിലവിലെ കാലാവസ്ഥാ ഡാറ്റയെ അടിസ്ഥാനമാക്കി, എനിക്ക് 28°C താപനിലയോടെ വ്യക്തമായ ആകാശം കാണാൻ കഴിയുന്നു. അടുത്ത കുറച്ച് ദിവസങ്ങൾ കൃഷി പ്രവർത്തനങ്ങൾക്ക് അനുകൂലമായിരിക്കും. 2 ദിവസത്തിനുള്ളിൽ മഴയുടെ 30% സാധ്യതയുണ്ട്, ഇത് നിങ്ങളുടെ വിളകൾക്ക് നല്ലതായിരിക്കും. വിശദമായ കാലാവസ്ഥാ പ്രവചനങ്ങൾ ആവശ്യമാണോ?";
          } else if (message.includes('crop') || message.includes('plant') || message.includes('grow') || 
                    message.includes('വിള') || message.includes('നട') || message.includes('വളർത്തുക')) {
            botResponse = "ഈ സീസണിലും നിങ്ങളുടെ പ്രദേശത്തും, ടൊമാറ്റോകൾ, ഭിന്ദി, അല്ലെങ്കിൽ ഇലക്കറികൾ പോലുള്ള വിളകൾ പരിഗണിക്കാൻ ഞാൻ ശുപാർശ ചെയ്യുന്നു. ഈ വിളകൾ നിലവിലെ കാലാവസ്ഥാ സാഹചര്യങ്ങളിൽ നന്നായി വളരുന്നു. നിങ്ങൾ ഇപ്പോൾ വളർത്തുകയോ ആസൂത്രണം ചെയ്യുകയോ ചെയ്യുന്ന വിളകളുടെ തരം എന്താണ്?";
          } else if (message.includes('soil') || message.includes('fertilizer') || message.includes('nutrient') || 
                    message.includes('മണ്ണ്') || message.includes('വളം') || message.includes('പോഷകം')) {
            botResponse = "മണ്ണിന്റെ ആരോഗ്യം മികച്ച വിളവിന് വളരെ പ്രധാനമാണ്! മണ്ണിന്റെ pH പരിശോധന നടത്താൻ ഞാൻ ശുപാർശ ചെയ്യുന്നു. പൊതുവേ, ജൈവ കമ്പോസ്റ്റ് ചേർക്കുകയും ശരിയായ ഡ്രെയിനേജ് നിലനിർത്തുകയും ചെയ്യുന്നത് സഹായിക്കുന്നു. പ്രത്യേക വള ശുപാർശകൾക്ക്, എനിക്ക് നിങ്ങളുടെ വിള തരവും നിലവിലെ മണ്ണ് അവസ്ഥയും അറിയേണ്ടതുണ്ട്.";
          } else if (message.includes('pest') || message.includes('disease') || message.includes('insect') || 
                    message.includes('കീടം') || message.includes('രോഗം') || message.includes('പ്രശ്നം')) {
            botResponse = "ആരോഗ്യമുള്ള വിളകൾക്ക് കീട നിയന്ത്രണം പ്രധാനമാണ്. സാധാരണ പ്രതിരോധ നടപടികൾ ഉൾപ്പെടുന്നു: പതിവ് വയൽ പരിശോധന, വിള മാറ്റിവയ്ക്കൽ, നീം അടിസ്ഥാനമാക്കിയ ജൈവ കീടനാശിനികൾ ഉപയോഗിക്കൽ. നിങ്ങൾ പ്രത്യേക ലക്ഷണങ്ങൾ ശ്രദ്ധിക്കുകയാണെങ്കിൽ, ശരിയായ തിരിച്ചറിയലിനായി ഞങ്ങളുടെ കീട കണ്ടെത്തൽ സവിശേഷത ഉപയോഗിക്കാം.";
          } else if (message.includes('yield') || message.includes('harvest') || message.includes('production') || 
                    message.includes('വിളവ്') || message.includes('അനുഭവം') || message.includes('ഉത്പാദനം')) {
            botResponse = "വിളവ് മെച്ചപ്പെടുത്താൻ, ശ്രദ്ധ കേന്ദ്രീകരിക്കുക: ശരിയായ അകലം, സമയബന്ധിതമായ ജലസേചനം, സന്തുലിത പോഷണം, കീട നിയന്ത്രണം. ഒപ്റ്റിമൽ വിളവെടുപ്പ് സമയം നിങ്ങളുടെ വിള തരത്തെ ആശ്രയിച്ചിരിക്കുന്നു. നിലവിലെ സാഹചര്യങ്ങളെ അടിസ്ഥാനമാക്കി പ്രതീക്ഷിക്കുന്ന ഉത്പാദനം അളക്കാൻ ഞങ്ങളുടെ വിളവ് പ്രവചന ഉപകരണം സഹായിക്കും.";
          } else if (message.includes('water') || message.includes('irrigation') || message.includes('moisture') || 
                    message.includes('വെള്ളം') || message.includes('ജലസേചനം') || message.includes('ഈർപ്പം')) {
            botResponse = "ജല നിയന്ത്രണം പ്രധാനമാണ്! നിലവിലെ കാലാവസ്ഥാ സാഹചര്യങ്ങളോടെ, രാവിലത്തെ ജലസേചനം ഏറ്റവും ഫലപ്രദമാണ്. 2-3 ഇഞ്ച് ആഴത്തിൽ മണ്ണിന്റെ ഈർപ്പം പരിശോധിക്കുക. ഡ്രിപ്പ് ഇറിഗേഷൻ ഫ്ലഡ് ഇറിഗേഷനെ അപേക്ഷിച്ച് 30-50% വെള്ളം ലാഭിക്കും. നിങ്ങൾ ഇപ്പോൾ ജലസേചനം എങ്ങനെ നിയന്ത്രിക്കുന്നു?";
          } else if (message.includes('subsidy') || message.includes('scheme') || message.includes('government') || 
                    message.includes('സബ്സിഡി') || message.includes('സ്കീം') || message.includes('സർക്കാർ')) {
            botResponse = "കർഷകർക്ക് നിരവധി സർക്കാർ പദ്ധതികൾ ലഭ്യമാണ്. നിലവിൽ, ഒരു പുതിയ ജൈവ വള സബ്സിഡി പദ്ധതി ഉണ്ട്. ഏറ്റവും പുതിയ അപ്ഡേറ്റുകൾക്കായി സർക്കാർ ഉപദേശങ്ങൾ വിഭാഗം പരിശോധിക്കാൻ ഞാൻ ശുപാർശ ചെയ്യുന്നു. പ്രത്യേക പദ്ധതി അപേക്ഷകളിൽ സഹായം ആവശ്യമാണോ?";
          } else if (message.includes('price') || message.includes('market') || message.includes('sell') || 
                    message.includes('വില') || message.includes('മാർക്കറ്റ്') || message.includes('വിൽക്കുക')) {
            botResponse = "മാർക്കറ്റ് വിലകൾ വിതരണവും ആവശ്യകതയും അടിസ്ഥാനമാക്കി മാറുന്നു. പതിവായി പ്രാദേശിക മണ്ഡി വിലകൾ പരിശോധിക്കാൻ ഞാൻ നിർദ്ദേശിക്കുന്നു. മെച്ചപ്പെട്ട വിലകൾക്കായി ഉപഭോക്താക്കൾക്ക് നേരിട്ട് വിൽപ്പനയോ പ്രോസസ്സിംഗ് മുഖേന മൂല്യ വർദ്ധനയോ പരിഗണിക്കുക. നിങ്ങൾ ഏത് വിളകൾ വിൽക്കാൻ ആസൂത്രണം ചെയ്യുന്നു?";
          } else {
            const generalResponses = [
              "നിങ്ങളുടെ എല്ലാ കൃഷി ചോദ്യങ്ങളിലും സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്! കാലാവസ്ഥ, വിളകൾ, മണ്ണിന്റെ ആരോഗ്യം, കീട നിയന്ത്രണം, അല്ലെങ്കിൽ ഏതെങ്കിലും കൃഷി രീതികളെക്കുറിച്ച് എന്നോട് ചോദിക്കാം.",
              "അത് ഒരു മികച്ച ചോദ്യമാണ്! നിങ്ങളുടെ AI കൃഷി അസിസ്റ്റന്റ് ആയി, വിള തിരഞ്ഞെടുക്കൽ, കാലാവസ്ഥാ ആസൂത്രണം, മണ്ണ് നിയന്ത്രണം, സുസ്ഥിര കൃഷി രീതികളിൽ മാർഗ്ഗനിർദ്ദേശം നൽകാൻ എനിക്ക് കഴിയും.",
              "അതിൽ സഹായിക്കാൻ എനിക്ക് സന്തോഷമുണ്ട്! നിങ്ങളുടെ വിളകൾ, കൃഷി സാങ്കേതിക വിദ്യകൾ, അല്ലെങ്കിൽ നിങ്ങൾ നേരിടുന്ന ഏതെങ്കിലും കൃഷി വെല്ലുവിളികളെക്കുറിച്ച് പ്രത്യേക ചോദ്യങ്ങൾ ചോദിക്കാൻ മടിക്കേണ്ട.",
              "നിങ്ങളുടെ കൃഷി അസിസ്റ്റന്റ് ആയി, വിള ശുപാർശകൾ, കാലാവസ്ഥാ വിശകലനം, കീട തിരിച്ചറിയൽ, കൃഷി മികച്ച രീതികളിൽ സഹായിക്കാൻ എനിക്ക് കഴിയും. നിങ്ങൾക്ക് ഏത് പ്രത്യേക മേഖലയിൽ സഹായം ആവശ്യമാണ്?",
            ];
            botResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
          }
        } else {
          // English demo responses (existing code)
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
        }
      } else {
        // Use selected language preference instead of detecting from text
        const selectedLang = currentLanguage;
        console.log('Chatbot: using selected language', { selectedLang, message: userMessage });
        
        // Use dedicated Malayalam chatbot when Malayalam is selected
        const isMalayalamSelected = selectedLang === 'malayalam';
        const endpoint = isMalayalamSelected ? '/api/malayalam-chatbot' : '/api/chatbot';
        
        console.log('Using endpoint:', endpoint, 'for selected language:', selectedLang);
        const response = await axios.post(endpoint, {
          message: userMessage,
          context: 'farmer_chatbot_page',
          userId: user?.id,
          selectedLanguage: selectedLang
        });
        botResponse = response.data.reply;
        if (!botResponse || botResponse.trim() === '') {
          // Provide a clearer fallback message so users know the backend returned nothing
          botResponse = t('chatbotErrorMessage') || 'Sorry, I\'m having trouble responding right now. Please try again later.';
        }
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
  }, [chatMessage, loading, isDemoMode, user, t, currentLanguage]);

  const handleSuggestionClick = (suggestion) => {
    setChatMessage(suggestion);
  };

  // Keep a stable ref to the submit handler so SpeechRecognition can call it without effect deps
  useEffect(() => {
    handleChatSubmitRef.current = handleChatSubmit;
  }, [handleChatSubmit]);

  const clearChat = () => {
    setChatHistory([]);
    toast.success(t('chatCleared') || 'Chat cleared');
  };

  // Ask Expert handlers
  const closeExpert = () => {
    setIsExpertOpen(false);
    setExpertQuery('');
    setIsExpertRecording(false);
  };

  const submitExpertQuery = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const q = expertQuery.trim();
    if (!q) return toast.error(t('enterQuestion') || 'Please enter a question for the expert');

    // Add a user-like message indicating question to expert
    setChatHistory(prev => [...prev, { type: 'user', message: q, timestamp: new Date(), meta: { toExpert: true } }]);
    closeExpert();

    // Show temporary typing
    setIsTyping(true);
    try {
      let expertReply;
      if (isDemoMode) {
        await new Promise(r => setTimeout(r, 1200));
        expertReply = "I recommend checking local extension offices and contacting an agronomist in your area for specific assistance. Meanwhile, try the following: take clear photos of the issue, note recent weather, and the crop stage.";
      } else {
        const resp = await axios.post('/api/expert', { question: q, userId: user?.id });
        expertReply = resp.data.answer;
      }

      setChatHistory(prev => [...prev, { type: 'bot', message: expertReply, timestamp: new Date(), meta: { fromExpert: true } }]);
      // Auto-play expert reply audio for accessibility
      try { toggleSpeak(chatHistory.length + 1, expertReply, detectedLanguage === 'auto' ? 'en-US' : detectedLanguage); } catch(e) {}
    } catch (err) {
      console.error('Expert API error', err);
      setChatHistory(prev => [...prev, { type: 'bot', message: t('expertError') || 'Unable to reach expert right now. Please try again later.', timestamp: new Date() }]);
      toast.error(t('expertError') || 'Expert request failed');
    } finally {
      setIsTyping(false);
    }
  };

  const quickSuggestions = currentLanguage === 'malayalam' ? [
    "ഇന്നത്തെ കാലാവസ്ഥ എങ്ങനെയാണ്?",
    "ഞാൻ ഏത് വിളകളാണ് നടേണ്ടത്?",
    "മണ്ണിന്റെ ആരോഗ്യം എങ്ങനെ മെച്ചപ്പെടുത്താം?",
    "കീട ആക്രമണം എങ്ങനെ തടയാം?",
    "എപ്പോൾ വിളകൾക്ക് വെള്ളം നൽകണം?",
    "നിലവിലെ മാർക്കറ്റ് വിലകൾ എന്താണ്?",
    "സർക്കാർ പദ്ധതികളെക്കുറിച്ച് പറയുക",
    "വിളവെടുപ്പിന് ഏറ്റവും നല്ല സമയം എപ്പോഴാണ്?"
  ] : [
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
                <h1 className="text-lg font-bold text-gray-800">
                  {currentLanguage === 'malayalam' ? 'AI കൃഷി സഹായി' : (t('aiFarmAssistant') || 'AI Farm Assistant')}
                </h1>
                <p className="text-xs text-gray-500">
                  {currentLanguage === 'malayalam' ? 'എപ്പോഴും സഹായിക്കാൻ ഇവിടെ' : (t('alwaysHereToHelp') || 'Always here to help')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpertOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
              title={t('askExpert') || 'Ask an Expert'}
            >
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700 hidden sm:inline">
                {currentLanguage === 'malayalam' ? 'വിദഗ്ധനോട് ചോദിക്കുക' : (t('askExpert') || 'Ask Expert')}
              </span>
            </button>

            <button
              onClick={clearChat}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={t('clearChat') || 'Clear Chat'}
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>
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
                {currentLanguage === 'malayalam' ? 'AI കൃഷി സഹായിയിലേക്ക് സ്വാഗതം!' : (t('welcomeToAIAssistant') || 'Welcome to AI Farm Assistant!')}
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                {currentLanguage === 'malayalam' ? 'കൃഷി ഉപദേശം, കാലാവസ്ഥാ വിവരങ്ങൾ, വിള ശുപാർശകൾ, കൃഷിയുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾക്ക് ഉത്തരം എന്നിവയിൽ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്.' : (t('aiAssistantDescription') || 'I\'m here to help you with farming advice, weather information, crop recommendations, and answer any agricultural questions you might have.')}
              </p>
              
              {/* Quick Suggestions Grid */}
              <div className="w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {currentLanguage === 'malayalam' ? 'വേഗത്തിലുള്ള നിർദ്ദേശങ്ങൾ' : (t('quickSuggestions') || 'Quick Suggestions')}
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
                      {chat.type === 'bot' && (
                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            onClick={() => toggleSpeak(index, chat.message, detectedLanguage === 'auto' ? 'en-US' : detectedLanguage)}
                            className={`text-xs px-2 py-1 rounded-md ${speakingIndex === index ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                            title={speakingIndex === index ? (t('stop') || 'Stop') : (t('playReply') || 'Play reply')}
                          >
                            {speakingIndex === index ? '⏹ Stop' : `▶ ${t('play') || 'Play'}`}
                          </button>
                          {/* Expert CTA: show if this bot reply is not already from an expert */}
                          {!chat.meta?.fromExpert && (
                            <div className="ml-2">
                              <button
                                onClick={() => {
                                  // Find the most recent user message before this bot reply
                                  const prevUserMsg = (() => {
                                    for (let i = index - 1; i >= 0; i--) {
                                      if (chatHistory[i].type === 'user') return chatHistory[i].message;
                                    }
                                    return null;
                                  })();
                                  const prefill = prevUserMsg ? prevUserMsg : chat.message;
                                  setExpertQuery(prefill);
                                  setIsExpertOpen(true);
                                }}
                                className="text-xs px-2 py-1 rounded-md bg-yellow-100 hover:bg-yellow-200 ml-2"
                                title={t('askExpert') || 'Ask Expert'}
                              >
                                {t('askExpert') || 'Ask Expert'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
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
                placeholder={currentLanguage === 'malayalam' ? 'നിങ്ങളുടെ കൃഷി സംബന്ധമായ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...' : (t('typeYourQuestion') || 'Type your farming question here...')}
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
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => { isRecording ? stopRecording() : startRecording(); }}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border ${isRecording ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200 hover:bg-gray-100'}`}
                title={isRecording ? (t('stopRecording') || 'Stop recording') : (t('startRecording') || 'Start recording')}
              >
                <Mic className="h-5 w-5 text-gray-700" />
              </button>
              <button
                type="submit"
                className="w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                disabled={!chatMessage.trim() || loading}
                title={t('sendMessage') || 'Send Message'}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Expert Modal */}
        {isExpertOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg w-full max-w-xl mx-4 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{t('askExpert') || 'Ask an Expert'}</h3>
                <button onClick={closeExpert} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <form onSubmit={submitExpertQuery} className="space-y-3">
                <textarea
                  value={expertQuery}
                  onChange={(e) => setExpertQuery(e.target.value)}
                  placeholder={t('describeIssue') || 'Describe your issue or question for an expert...'}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => { isExpertRecording ? stopExpertRecording() : startExpertRecording(); }}
                      className={`px-3 py-2 rounded-md border ${isExpertRecording ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      {isExpertRecording ? (t('stopRecording') || 'Stop') : (t('recordQuestion') || 'Record')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpertQuery('')}
                      className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                    >
                      {t('clear') || 'Clear'}
                    </button>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('askExpertNow') || 'Ask Expert'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;