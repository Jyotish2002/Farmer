import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation data
const translations = {
  english: {
    // App Name
    appName: 'Krishi Sahayi',
    
    // Navigation & Header
    language: 'Language',
    refresh: 'Refresh',
    logout: 'Logout',
    settings: 'Settings',
    
    // Greetings
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    farmer: 'Farmer',
    productiveDayMessage: 'Hope you\'re having a productive day on the farm',
    
    // Weather Section
    weatherReport: 'Weather Report',
    tapForForecast: 'Tap for forecast',
    weatherNotAvailable: 'Weather data not available',
    loadingForecast: 'Loading forecast...',
    extendedForecast: 'Extended Weather Forecast',
    dayForecast: '5-Day Weather Forecast',
    
    // Weather Details
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    visibility: 'Visibility',
    pressure: 'Pressure',
    rainChance: 'Rain Chance',
    rainfall: 'Rainfall',
    
    // Weather Conditions
    clear: 'Clear',
    sunny: 'Sunny',
    partlyCloudy: 'Partly Cloudy',
    cloudy: 'Cloudy',
    overcast: 'Overcast',
    lightRain: 'Light Rain',
    moderateRain: 'Moderate Rain',
    heavyRain: 'Heavy Rain',
    
    // Quick Actions
    quickActions: 'Quick Actions',
    soilAnalysis: 'Soil Analysis',
    soilAnalysisDesc: 'Analyze your soil health',
    pestDetection: 'Pest Detection',
    pestDetectionDesc: 'Identify crop pests',
    yieldPrediction: 'Yield Prediction',
    yieldPredictionDesc: 'Predict crop yields',
    aiChatAssistant: 'AI Chat Assistant',
    aiChatAssistantDesc: 'Get farming advice',
    
    // Government Advisories
    govAdvisories: 'Government Advisories',
    noAdvisoriesAvailable: 'No advisories available',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    // AI Chat
    aiFarmAssistant: 'AI Farm Assistant',
    askAnything: 'Ask me anything about farming!',
    askAboutCrops: 'Ask about crops, weather, fertilizers...',
    send: 'Send',
    
    // Chatbot Page
    goBack: 'Go Back',
    alwaysHereToHelp: 'Always here to help',
    clearChat: 'Clear Chat',
    welcomeToAIAssistant: 'Welcome to AI Farm Assistant!',
    aiAssistantDescription: 'I\'m here to help you with farming advice, weather information, crop recommendations, and answer any agricultural questions you might have.',
    quickSuggestions: 'Quick Suggestions',
    typeYourQuestion: 'Type your farming question here...',
    sendMessage: 'Send Message',
    chatCleared: 'Chat cleared',
    chatbotError: 'Chat error occurred',
    chatbotErrorMessage: 'Sorry, I\'m having trouble responding right now. Please try again later.',
    weatherToday: 'What\'s the weather like today?',
    cropRecommendations: 'What crops should I plant?',
    soilHealthTips: 'How can I improve soil health?',
    pestPrevention: 'How to prevent pest attacks?',
    irrigationAdvice: 'When should I water my crops?',
    marketPrices: 'What are current market prices?',
    governmentSchemes: 'Tell me about government schemes',
    harvestTiming: 'When is the best time to harvest?',
    
    // Weather Alerts
    highRainChance: 'High chance of rain - Good for irrigation savings',
    strongWindWarning: 'Strong winds expected - Secure crops and equipment',
    
    // Farming Recommendations
    farmingRecommendations: 'Farming Recommendations',
    planIrrigation: 'Plan irrigation based on rainfall predictions',
    monitorWind: 'Monitor wind speeds for pesticide application',
    usePressure: 'Use pressure changes to predict weather patterns',
    scheduleWork: 'Schedule field work during favorable conditions',
    
    // Login
    welcomeBack: 'Welcome back to',
    loginWithGoogle: 'Login with Google',
    demoLogin: 'Demo Login',
    loginSubtitle: 'Your smart farming companion for better yields',
    
    // Crop Recommendation
    cropRecommendation: 'Crop Recommendation',
    soilPh: 'Soil pH',
    temperatureInput: 'Temperature (°C)',
    rainfallInput: 'Rainfall (mm)',
    getRecommendation: 'Get Recommendation',
    recommendedCrop: 'Recommended Crop',
    confidence: 'Confidence',
    reason: 'Reason',
    enterValidValues: 'Please enter valid values for all fields',
    fillAllFields: 'Please fill in all fields',
    
    // Yield Prediction
    cropType: 'Crop Type',
    area: 'Area (hectares)',
    inputCost: 'Input Cost (₹)',
    selectCrop: 'Select a crop',
    predictYield: 'Predict Yield',
    predictedYield: 'Predicted Yield',
    expectedProfit: 'Expected Profit',
    profitMargin: 'Profit Margin',
    tons: 'tons',
    
    // Pest Detection
    uploadImage: 'Upload Plant Image',
    selectImage: 'Select Image',
    analyzeImage: 'Analyze Image',
    dragDropImage: 'Drag and drop an image here, or click to select',
    fileSizeError: 'File size should be less than 5MB',
    pestIdentified: 'Pest Identified',
    diseaseIdentified: 'Disease Identified',
    recommendations: 'Recommendations',
    severity: 'Severity',
    
    // Common Actions
    analyzing: 'Analyzing...',
    processing: 'Processing...',
    cancel: 'Cancel',
    submit: 'Submit',
    reset: 'Reset',
    
    // Crop Recommendation Page
    aiCropRecommendationDesc: 'Get AI-powered crop recommendations based on your soil and weather conditions',
    enterSoilPh: 'Enter soil pH (0-14)',
    enterTemperature: 'Enter temperature in Celsius',
    enterRainfall: 'Enter annual rainfall in mm',
    recommendationGenerated: 'Crop recommendation generated!',
    failedToGetRecommendation: 'Failed to get crop recommendation. Please try again.',
    alternativeCrops: 'Alternative crops',
    
    // Yield Prediction Page
    farmArea: 'Farm Area (Hectares)',
    enterFarmArea: 'Enter farm area in hectares',
    enterInputCost: 'Enter total input cost in rupees',
    predictingYield: 'Predicting Yield...',
    predictYieldProfit: 'Predict Yield & Profit',
    yieldPredictionGenerated: 'Yield prediction generated!',
    failedToGetYieldPrediction: 'Failed to get yield prediction. Please try again.',
    afterDeductingCosts: 'After deducting input costs',
    kg: 'kg',
    tipsForBetterYield: 'Tips for Better Yield',
    useQualitySeeds: 'Use quality seeds and proper soil preparation',
    followFertilizerSchedule: 'Follow recommended fertilizer schedules',
    monitorWeatherPests: 'Monitor weather conditions and pest activity',
    ensureIrrigationDrainage: 'Ensure adequate irrigation and drainage',
    
    // Pest Detection Page
    uploadCropImage: 'Upload Crop Image',
    selectImageFile: 'Please select an image file',
    fileSizeLimit: 'File size should be less than 5MB',
    selectImageToAnalyze: 'Please select an image to analyze',
    imageAnalyzedSuccessfully: 'Image analyzed successfully!',
    failedToAnalyzeImage: 'Failed to analyze image. Please try again.',
    removeImage: 'Remove Image',
    chooseImage: 'Choose Image',
    supportedFormats: 'Supported formats: JPG, PNG, GIF (Max 5MB)',
    analyzingImage: 'Analyzing Image...',
    analyzeForPests: 'Analyze for Pests & Diseases',
    analysisResults: 'Analysis Results',
    analyzedOn: 'Analyzed on',
    tipsForBetterAnalysis: 'Tips for Better Analysis',
    takeClearPhotos: 'Take clear, well-lit photos of affected plant parts',
    includeCloseupViews: 'Include close-up views of symptoms or pests',
    avoidBlurryImages: 'Avoid blurry or low-resolution images',
    captureMultipleAngles: 'Capture multiple angles if possible',
    
    // Crop Types
    rice: 'Rice',
    wheat: 'Wheat',
    maize: 'Maize',
    cotton: 'Cotton',
    sugarcane: 'Sugarcane',
    potato: 'Potato',
    tomato: 'Tomato',
    onion: 'Onion',
    soybean: 'Soybean',
    groundnut: 'Groundnut',
    barley: 'Barley',
    millet: 'Millet',
    
    // Days of week
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    
    // Months
    jan: 'Jan',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    may: 'May',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Aug',
    sep: 'Sep',
    oct: 'Oct',
    nov: 'Nov',
    dec: 'Dec',
    
    // Common Actions
    tryAgain: 'Try Again',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Dashboard Messages
    dashboardRefreshed: 'Dashboard refreshed',
    failedToLoadData: 'Failed to load dashboard data',
    unableToLoadForecast: 'Unable to load forecast data',
    failedToLoadForecast: 'Failed to load weather forecast',
    
    // Login page translations
    tagline: 'Your AI-powered farming companion',
    signInToAccount: 'Sign in to your account',
    accessInsights: 'Access personalized farming insights and recommendations',
    continueWithGoogle: 'Continue with Google',
    forDevelopment: 'For Development',
    termsAgreement: 'By signing in, you agree to our Terms of Service and Privacy Policy'
  },
  
  malayalam: {
    // App Name
    appName: 'കൃഷി സഹായി',
    
    // Navigation & Header
    language: 'ഭാഷ',
    refresh: 'പുതുക്കുക',
    logout: 'പുറത്തുകടക്കുക',
    settings: 'ക്രമീകരണങ്ങൾ',
    
    // Greetings
    goodMorning: 'സുപ്രഭാതം',
    goodAfternoon: 'നമസ്‌കാരം',
    goodEvening: 'സുസന്ധ്യ',
    farmer: 'കർഷകരേ',
    productiveDayMessage: 'കൃഷിയിൽ ഉത്പാദനക്ഷമമായ ഒരു ദിവസം ആയിരിക്കുമെന്ന് പ്രത്യാശിക്കുന്നു',
    
    // Weather Section
    weatherReport: 'കാലാവസ്ഥ റിപ്പോർട്ട്',
    tapForForecast: 'പ്രവചനത്തിനായി ടാപ്പ് ചെയ്യുക',
    weatherNotAvailable: 'കാലാവസ്ഥാ വിവരങ്ങൾ ലഭ്യമല്ല',
    loadingForecast: 'പ്രവചനം ലോഡ് ചെയ്യുന്നു...',
    extendedForecast: 'വിപുലമായ കാലാവസ്ഥാ പ്രവചനം',
    dayForecast: '5-ദിവസത്തെ കാലാവസ്ഥാ പ്രവചനം',
    
    // Weather Details
    feelsLike: 'അനുഭവപ്പെടുന്നത്',
    humidity: 'ആർദ്രത',
    windSpeed: 'കാറ്റിന്റെ വേഗത',
    visibility: 'ദൃശ്യത',
    pressure: 'മർദ്ദം',
    rainChance: 'മഴയുടെ സാധ്യത',
    rainfall: 'മഴയുടെ അളവ്',
    
    // Weather Conditions
    clear: 'തെളിഞ്ഞ',
    sunny: 'വെയിലുള്ള',
    partlyCloudy: 'ഭാഗികമായി മേഘാവൃതം',
    cloudy: 'മേഘാവൃതം',
    overcast: 'കനത്ത മേഘം',
    lightRain: 'നേരിയ മഴ',
    moderateRain: 'മിതമായ മഴ',
    heavyRain: 'കനത്ത മഴ',
    
    // Quick Actions
    quickActions: 'പെട്ടെന്നുള്ള പ്രവർത്തനങ്ങൾ',
    soilAnalysis: 'മണ്ണ് വിശകലനം',
    soilAnalysisDesc: 'നിങ്ങളുടെ മണ്ണിന്റെ ആരോഗ്യം വിശകലനം ചെയ്യുക',
    pestDetection: 'കീട കണ്ടെത്തൽ',
    pestDetectionDesc: 'വിള കീടങ്ങളെ തിരിച്ചറിയുക',
    yieldPrediction: 'വിള പ്രവചനം',
    yieldPredictionDesc: 'വിള വിളവ് പ്രവചിക്കുക',
    aiChatAssistant: 'AI ചാറ്റ് സഹായി',
    aiChatAssistantDesc: 'കൃഷി ഉപദേശം നേടുക',
    
    // Government Advisories
    govAdvisories: 'സർക്കാർ ഉപദേശങ്ങൾ',
    noAdvisoriesAvailable: 'ഉപദേശങ്ങൾ ലഭ്യമല്ല',
    priority: 'മുൻഗണന',
    high: 'ഉയർന്ന',
    medium: 'ഇടത്തരം',
    low: 'താഴ്ന്ന',
    
    // AI Chat
    aiFarmAssistant: 'AI കൃഷി സഹായി',
    askAnything: 'കൃഷിയെക്കുറിച്ച് എന്തും ചോദിക്കുക!',
    askAboutCrops: 'വിള, കാലാവസ്ഥ, വളം എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...',
    send: 'അയയ്ക്കുക',
    
    // Chatbot Page
    goBack: 'തിരിച്ചു പോകുക',
    alwaysHereToHelp: 'എപ്പോഴും സഹായിക്കാൻ ഇവിടെ',
    clearChat: 'ചാറ്റ് മായ്ക്കുക',
    welcomeToAIAssistant: 'AI കൃഷി സഹായിയിലേക്ക് സ്വാഗതം!',
    aiAssistantDescription: 'കൃഷി ഉപദേശം, കാലാവസ്ഥാ വിവരങ്ങൾ, വിള ശുപാർശകൾ, കൃഷിയുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾക്ക് ഉത്തരം എന്നിവയിൽ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്.',
    quickSuggestions: 'പെട്ടെന്നുള്ള നിർദ്ദേശങ്ങൾ',
    typeYourQuestion: 'നിങ്ങളുടെ കൃഷി ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...',
    sendMessage: 'സന്ദേശം അയയ്ക്കുക',
    chatCleared: 'ചാറ്റ് മായ്ച്ചു',
    chatbotError: 'ചാറ്റ് പിശക് സംഭവിച്ചു',
    chatbotErrorMessage: 'ക്ഷമിക്കണം, എനിക്ക് ഇപ്പോൾ പ്രതികരിക്കാൻ പ്രശ്‌നമുണ്ട്. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക.',
    weatherToday: 'ഇന്നത്തെ കാലാവസ്ഥ എങ്ങനെയാണ്?',
    cropRecommendations: 'ഞാൻ ഏത് വിളകളാണ് നടേണ്ടത്?',
    soilHealthTips: 'മണ്ണിന്റെ ആരോഗ്യം എങ്ങനെ മെച്ചപ്പെടുത്താം?',
    pestPrevention: 'കീട ആക്രമണം എങ്ങനെ തടയാം?',
    irrigationAdvice: 'എപ്പോൾ വിളകൾക്ക് വെള്ളം നൽകണം?',
    marketPrices: 'നിലവിലെ മാർക്കറ്റ് വിലകൾ എന്താണ്?',
    governmentSchemes: 'സർക്കാർ പദ്ധതികളെക്കുറിച്ച് പറയുക',
    harvestTiming: 'വിളവെടുപ്പിന് ഏറ്റവും നല്ല സമയം എപ്പോഴാണ്?',
    
    // Weather Alerts
    highRainChance: 'മഴയുടെ ഉയർന്ന സാധ്യത - ജലസേചന ലാഭത്തിന് നല്ലത്',
    strongWindWarning: 'ശക്തമായ കാറ്റ് പ്രതീക്ഷിക്കുന്നു - വിളകളും ഉപകരണങ്ങളും സുരക്ഷിതമാക്കുക',
    
    // Farming Recommendations
    farmingRecommendations: 'കൃഷി ശുപാർശകൾ',
    planIrrigation: 'മഴ പ്രവചനത്തെ അടിസ്ഥാനമാക്കി ജലസേചനം ആസൂത്രണം ചെയ്യുക',
    monitorWind: 'കീടനാശിനി പ്രയോഗത്തിനായി കാറ്റിന്റെ വേഗത നിരീക്ഷിക്കുക',
    usePressure: 'കാലാവസ്ഥാ പാറ്റേണുകൾ പ്രവചിക്കാൻ മർദ്ദ മാറ്റങ്ങൾ ഉപയോഗിക്കുക',
    scheduleWork: 'അനുകൂലമായ സാഹചര്യങ്ങളിൽ വയൽ ജോലികൾ ഷെഡ്യൂൾ ചെയ്യുക',
    
    // Login
    welcomeBack: 'തിരിച്ചു വന്നതിൽ സന്തോഷം',
    loginWithGoogle: 'Google ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക',
    demoLogin: 'ഡെമോ ലോഗിൻ (ഓതന്റിക്കേഷൻ ആവശ്യമില്ല)',
    loginSubtitle: 'മെച്ചപ്പെട്ട വിളവിനുള്ള നിങ്ങളുടെ സ്മാർട്ട് കൃഷി സഹയാത്രി',
    
    // Days of week
    sun: 'ഞായർ',
    mon: 'തിങ്കൾ',
    tue: 'ചൊവ്വ',
    wed: 'ബുധൻ',
    thu: 'വ്യാഴം',
    fri: 'വെള്ളി',
    sat: 'ശനി',
    
    // Months
    jan: 'ജനു',
    feb: 'ഫെബ്',
    mar: 'മാർ',
    apr: 'ഏപ്രി',
    may: 'മേയ്',
    jun: 'ജൂൺ',
    jul: 'ജൂലൈ',
    aug: 'ഓഗ',
    sep: 'സെപ്',
    oct: 'ഒക്ടോ',
    nov: 'നവം',
    dec: 'ഡിസം',
    
    // Common Actions
    tryAgain: 'വീണ്ടും ശ്രമിക്കുക',
    close: 'അടയ്ക്കുക',
    loading: 'ലോഡ് ചെയ്യുന്നു...',
    error: 'പിശക്',
    success: 'വിജയം',
    analyzing: 'വിശകലനം ചെയ്യുന്നു...',
    processing: 'പ്രോസസ്സിംഗ്...',
    cancel: 'റദ്ദാക്കുക',
    submit: 'സമർപ്പിക്കുക',
    reset: 'പുനഃസജ്ജമാക്കുക',
    
    // Crop Recommendation Page
    cropRecommendation: 'വിള ശുപാർശ',
    aiCropRecommendationDesc: 'മണ്ണിന്റെയും കാലാവസ്ഥയുടെയും അടിസ്ഥാനത്തിൽ AI-പവർഡ് വിള ശുപാർശകൾ നേടുക',
    enterSoilPh: 'മണ്ണിന്റെ pH മൂല്യം നൽകുക (0-14)',
    enterTemperature: 'സെൽഷ്യസിൽ താപനില നൽകുക',
    enterRainfall: 'വാർഷിക മഴയുടെ അളവ് mm-ൽ നൽകുക',
    recommendationGenerated: 'വിള ശുപാർശ സൃഷ്ടിച്ചു!',
    failedToGetRecommendation: 'വിള ശുപാർശ നേടുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    alternativeCrops: 'ബദൽ വിളകൾ',
    
    // Yield Prediction Page
    farmArea: 'കൃഷിയിടത്തിന്റെ വിസ്തീർണ്ണം (ഹെക്ടർ)',
    enterFarmArea: 'ഹെക്ടറിൽ കൃഷിയിടത്തിന്റെ വിസ്തീർണ്ണം നൽകുക',
    enterInputCost: 'രൂപയിൽ മൊത്തം ഇൻപുട്ട് ചെലവ് നൽകുക',
    predictingYield: 'വിളവ് പ്രവചിച്ചുകൊണ്ടിരിക്കുന്നു...',
    predictYieldProfit: 'വിളവും ലാഭവും പ്രവചിക്കുക',
    yieldPredictionGenerated: 'വിളവ് പ്രവചനം സൃഷ്ടിച്ചു!',
    failedToGetYieldPrediction: 'വിളവ് പ്രവചനം നേടുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    afterDeductingCosts: 'ഇൻപുട്ട് ചെലവുകൾ കുറച്ചതിനുശേഷം',
    kg: 'കിലോ',
    tipsForBetterYield: 'മികച്ച വിളവിനുള്ള നുറുങ്ങുകൾ',
    useQualitySeeds: 'ഗുണമേന്മയുള്ള വിത്തുകളും ശരിയായ മണ്ണ് തയ്യാറാക്കലും ഉപയോഗിക്കുക',
    followFertilizerSchedule: 'ശുപാർശ ചെയ്യുന്ന വള ഷെഡ്യൂളുകൾ പിന്തുടരുക',
    monitorWeatherPests: 'കാലാവസ്ഥാ സാഹചര്യങ്ങളും കീട പ്രവർത്തനവും നിരീക്ഷിക്കുക',
    ensureIrrigationDrainage: 'മതിയായ ജലസേചനവും ഡ്രെയിനേജും ഉറപ്പാക്കുക',
    
    // Pest Detection Page
    uploadCropImage: 'വിള ചിത്രം അപ്‌ലോഡ് ചെയ്യുക',
    selectImageFile: 'ദയവായി ഒരു ചിത്ര ഫയൽ തിരഞ്ഞെടുക്കുക',
    fileSizeLimit: 'ഫയൽ വലുപ്പം 5MB-യിൽ കുറവായിരിക്കണം',
    selectImageToAnalyze: 'വിശകലനം ചെയ്യാൻ ദയവായി ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക',
    imageAnalyzedSuccessfully: 'ചിത്രം വിജയകരമായി വിശകലനം ചെയ്തു!',
    failedToAnalyzeImage: 'ചിത്ര വിശകലനത്തിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    removeImage: 'ചിത്രം നീക്കം ചെയ്യുക',
    chooseImage: 'ചിത്രം തിരഞ്ഞെടുക്കുക',
    supportedFormats: 'പിന്തുണയുള്ള ഫോർമാറ്റുകൾ: JPG, PNG, GIF (പരമാവധി 5MB)',
    analyzingImage: 'ചിത്രം വിശകലനം ചെയ്യുന്നു...',
    analyzeForPests: 'കീടങ്ങൾക്കും രോഗങ്ങൾക്കുമായി വിശകലനം ചെയ്യുക',
    analysisResults: 'വിശകലന ഫലങ്ങൾ',
    analyzedOn: 'വിശകലനം ചെയ്ത തീയതി',
    tipsForBetterAnalysis: 'മികച്ച വിശകലനത്തിനുള്ള നുറുങ്ങുകൾ',
    takeClearPhotos: 'ബാധിച്ച ചെടിയുടെ ഭാഗങ്ങളുടെ വ്യക്തവും നല്ല വെളിച്ചമുള്ളതുമായ ഫോട്ടോകൾ എടുക്കുക',
    includeCloseupViews: 'രോഗലക്ഷണങ്ങളുടെയോ കീടങ്ങളുടെയോ ക്ലോസ്-അപ്പ് കാഴ്ചകൾ ഉൾപ്പെടുത്തുക',
    avoidBlurryImages: 'മങ്ങിയതോ കുറഞ്ഞ റെസലൂഷനുള്ളതോ ആയ ചിത്രങ്ങൾ ഒഴിവാക്കുക',
    captureMultipleAngles: 'സാധ്യമെങ്കിൽ ഒന്നിലധികം കോണുകളിൽ നിന്ന് ചിത്രമെടുക്കുക',
    
    // Dashboard Messages
    dashboardRefreshed: 'ഡാഷ്ബോർഡ് പുതുക്കി',
    failedToLoadData: 'ഡാഷ്ബോർഡ് ഡാറ്റ ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു',
    unableToLoadForecast: 'പ്രവചന ഡാറ്റ ലോഡ് ചെയ്യാൻ കഴിയുന്നില്ല',
    failedToLoadForecast: 'കാലാവസ്ഥാ പ്രവചനം ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു',
    
    // Login page translations
    tagline: 'നിങ്ങളുടെ AI-പവർഡ് കൃഷി സഹായി',
    signInToAccount: 'നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് സൈൻ ഇൻ ചെയ്യുക',
    accessInsights: 'വ്യക്തിഗത കൃഷി ഉൾക്കാഴ്ചകളും ശുപാർശകളും ആക്സസ് ചെയ്യുക',
    continueWithGoogle: 'Google ഉപയോഗിച്ച് തുടരുക',
    forDevelopment: 'വികസനത്തിനായി',
    termsAgreement: 'സൈൻ ഇൻ ചെയ്യുന്നതിലൂടെ, നിങ്ങൾ ഞങ്ങളുടെ സേവന നിബന്ധനകളും സ്വകാര്യതാ നയവും അംഗീകരിക്കുน്നു'
  },
  
  hindi: {
    // App Name
    appName: 'कृषि सहायक',
    
    // Navigation & Header
    language: 'भाषा',
    refresh: 'ताज़ा करें',
    logout: 'लॉग आउट',
    settings: 'सेटिंग्स',
    
    // Greetings
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'नमस्ते',
    goodEvening: 'शुभ संध्या',
    farmer: 'किसान',
    productiveDayMessage: 'आशा है आपका खेती में उत्पादक दिन हो रहा है',
    
    // Weather Section
    weatherReport: 'मौसम रिपोर्ट',
    tapForForecast: 'पूर्वानुमान के लिए टैप करें',
    weatherNotAvailable: 'मौसम डेटा उपलब्ध नहीं',
    loadingForecast: 'पूर्वानुमान लोड हो रहा है...',
    extendedForecast: 'विस्तृत मौसम पूर्वानुमान',
    dayForecast: '5-दिन का मौसम पूर्वानुमान',
    
    // Weather Details
    feelsLike: 'महसूस होता है',
    humidity: 'नमी',
    windSpeed: 'हवा की गति',
    visibility: 'दृश्यता',
    pressure: 'वायुदाब',
    rainChance: 'बारिश की संभावना',
    rainfall: 'वर्षा',
    
    // Weather Conditions
    clear: 'साफ',
    sunny: 'धूप',
    partlyCloudy: 'आंशिक बादल',
    cloudy: 'बादलों से घिरा',
    overcast: 'घने बादल',
    lightRain: 'हल्की बारिश',
    moderateRain: 'मध्यम बारिश',
    heavyRain: 'भारी बारिश',
    
    // Quick Actions
    quickActions: 'त्वरित कार्य',
    soilAnalysis: 'मिट्टी विश्लेषण',
    soilAnalysisDesc: 'अपनी मिट्टी के स्वास्थ्य का विश्लेषण करें',
    pestDetection: 'कीट की पहचान',
    pestDetectionDesc: 'फसल के कीटों की पहचान करें',
    yieldPrediction: 'उत्पादन पूर्वानुमान',
    yieldPredictionDesc: 'फसल की उत्पादकता का पूर्वानुमान',
    aiChatAssistant: 'AI चैट सहायक',
    aiChatAssistantDesc: 'खेती की सलाह लें',
    
    // Government Advisories
    govAdvisories: 'सरकारी सलाह',
    noAdvisoriesAvailable: 'कोई सलाह उपलब्ध नहीं',
    priority: 'प्राथमिकता',
    high: 'उच्च',
    medium: 'मध्यम',
    low: 'निम्न',
    
    // AI Chat
    aiFarmAssistant: 'AI कृषि सहायक',
    askAnything: 'खेती के बारे में कुछ भी पूछें!',
    askAboutCrops: 'फसल, मौसम, उर्वरक के बारे में पूछें...',
    send: 'भेजें',
    
    // Chatbot Page
    alwaysHereToHelp: 'हमेशा मदद के लिए यहां',
    clearChat: 'चैट साफ़ करें',
    welcomeToAIAssistant: 'AI कृषि सहायक में आपका स्वागत है!',
    aiAssistantDescription: 'मैं आपको खेती की सलाह, मौसम की जानकारी, फसल की सिफारिशें और कृषि से संबंधित किसी भी प्रश्न में मदद करने के लिए यहां हूं।',
    quickSuggestions: 'त्वरित सुझाव',
    typeYourQuestion: 'अपना खेती का प्रश्न यहां टाइप करें...',
    sendMessage: 'संदेश भेजें',
    chatCleared: 'चैट साफ़ कर दिया गया',
    chatbotError: 'चैट त्रुटि हुई',
    chatbotErrorMessage: 'माफ़ करें, मुझे अभी जवाब देने में परेशानी हो रही है। कृपया बाद में पुनः प्रयास करें।',
    weatherToday: 'आज का मौसम कैसा है?',
    cropRecommendations: 'मुझे कौन सी फसलें लगानी चाहिए?',
    soilHealthTips: 'मिट्टी का स्वास्थ्य कैसे सुधारें?',
    pestPrevention: 'कीट के हमले कैसे रोकें?',
    irrigationAdvice: 'फसलों को कब पानी देना चाहिए?',
    marketPrices: 'वर्तमान बाजार दरें क्या हैं?',
    governmentSchemes: 'सरकारी योजनाओं के बारे में बताएं',
    harvestTiming: 'फसल काटने का सबसे अच्छा समय कब है?',
    
    // Weather Alerts
    highRainChance: 'बारिश की उच्च संभावना - सिंचाई की बचत के लिए अच्छा',
    strongWindWarning: 'तेज हवा की उम्मीद - फसल और उपकरण सुरक्षित करें',
    
    // Farming Recommendations
    farmingRecommendations: 'कृषि सिफारिशें',
    planIrrigation: 'वर्षा पूर्वानुमान के आधार पर सिंचाई की योजना बनाएं',
    monitorWind: 'कीटनाशक छिड़काव के लिए हवा की गति की निगरानी करें',
    usePressure: 'मौसम पैटर्न की भविष्यवाणी के लिए दबाव परिवर्तन का उपयोग करें',
    scheduleWork: 'अनुकूल परिस्थितियों में खेत का काम शेड्यूल करें',
    
    // Common Actions
    analyzing: 'विश्लेषण कर रहे हैं...',
    processing: 'प्रसंस्करण...',
    cancel: 'रद्द करें',
    submit: 'जमा करें',
    reset: 'रीसेट करें',
    goBack: 'वापस जाएं',
    
    // Crop Recommendation Page
    cropRecommendation: 'फसल सुझाव',
    aiCropRecommendationDesc: 'मिट्टी और मौसम की स्थिति के आधार पर AI-संचालित फसल सुझाव प्राप्त करें',
    enterSoilPh: 'मिट्टी का pH मान दर्ज करें (0-14)',
    enterTemperature: 'सेल्सियस में तापमान दर्ज करें',
    enterRainfall: 'mm में वार्षिक वर्षा दर्ज करें',
    recommendationGenerated: 'फसल सुझाव तैयार किया गया!',
    failedToGetRecommendation: 'फसल सुझाव प्राप्त करने में असफल। कृपया पुनः प्रयास करें।',
    alternativeCrops: 'वैकल्पिक फसलें',
    
    // Yield Prediction Page
    farmArea: 'खेत का क्षेत्रफल (हेक्टेयर)',
    enterFarmArea: 'हेक्टेयर में खेत का क्षेत्रफल दर्ज करें',
    enterInputCost: 'रुपयों में कुल इनपुट लागत दर्ज करें',
    predictingYield: 'उत्पादन की भविष्यवाणी की जा रही है...',
    predictYieldProfit: 'उत्पादन और लाभ की भविष्यवाणी करें',
    yieldPredictionGenerated: 'उत्पादन पूर्वानुमान तैयार किया गया!',
    failedToGetYieldPrediction: 'उत्पादन पूर्वानुमान प्राप्त करने में असफल। कृपया पुनः प्रयास करें।',
    afterDeductingCosts: 'इनपुट लागत घटाने के बाद',
    kg: 'किलो',
    tipsForBetterYield: 'बेहतर उत्पादन के लिए सुझाव',
    useQualitySeeds: 'गुणवत्तापूर्ण बीज और उचित मिट्टी तैयारी का उपयोग करें',
    followFertilizerSchedule: 'अनुशंसित उर्वरक कार्यक्रम का पालन करें',
    monitorWeatherPests: 'मौसम की स्थिति और कीट गतिविधि की निगरानी करें',
    ensureIrrigationDrainage: 'पर्याप्त सिंचाई और जल निकासी सुनिश्चित करें',
    
    // Pest Detection Page
    uploadCropImage: 'फसल की तस्वीर अपलोड करें',
    selectImageFile: 'कृपया एक छवि फ़ाइल चुनें',
    fileSizeLimit: 'फ़ाइल का आकार 5MB से कम होना चाहिए',
    selectImageToAnalyze: 'विश्लेषण के लिए कृपया एक छवि चुनें',
    imageAnalyzedSuccessfully: 'छवि का सफलतापूर्वक विश्लेषण किया गया!',
    failedToAnalyzeImage: 'छवि विश्लेषण में असफल। कृपया पुनः प्रयास करें।',
    removeImage: 'छवि हटाएं',
    chooseImage: 'छवि चुनें',
    supportedFormats: 'समर्थित प्रारूप: JPG, PNG, GIF (अधिकतम 5MB)',
    analyzingImage: 'छवि का विश्लेषण कर रहे हैं...',
    analyzeForPests: 'कीटों और रोगों के लिए विश्लेषण करें',
    analysisResults: 'विश्लेषण परिणाम',
    analyzedOn: 'विश्लेषण की तारीख',
    tipsForBetterAnalysis: 'बेहतर विश्लेषण के लिए सुझाव',
    takeClearPhotos: 'प्रभावित पौधे के हिस्सों की स्पष्ट, अच्छी रोशनी वाली तस्वीरें लें',
    includeCloseupViews: 'लक्षणों या कीटों के क्लोज-अप दृश्य शामिल करें',
    avoidBlurryImages: 'धुंधली या कम रिज़ॉल्यूशन वाली छवियों से बचें',
    captureMultipleAngles: 'यदि संभव हो तो कई कोणों से तस्वीरें लें'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('english');
  
  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      localStorage.setItem('selectedLanguage', language);
    }
  };

  const t = (key) => {
    return translations[currentLanguage][key] || translations.english[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'english', name: 'English', nativeName: 'English' },
      { code: 'malayalam', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'hindi', name: 'Hindi', nativeName: 'हिंदी' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;