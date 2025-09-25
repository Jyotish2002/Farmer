// Shared constants for the frontend
export const API_ENDPOINTS = {
  weather: '/api/weather',
  notifications: '/api/notifications',
  cropRecommendation: '/api/crop-recommendation',
  yieldPrediction: '/api/yield-prediction',
  pestDetection: '/api/pest-detection',
  chatbot: '/api/chatbot',
  auth: '/auth',
  admin: '/api/admin'
} as const;

export const SUPPORTED_CROPS = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 
  'Potato', 'Tomato', 'Onion', 'Soybean', 'Groundnut', 
  'Barley', 'Millet'
] as const;

export const VALIDATION_RANGES = {
  soilPh: { min: 0, max: 14 },
  temperature: { min: -50, max: 60 },
  rainfall: { min: 0, max: 5000 },
  area: { min: 0.1, max: 10000 },
  inputCost: { min: 0, max: 10000000 }
} as const;

export const NOTIFICATION_CATEGORIES = [
  'weather', 'crop', 'pest', 'market', 'policy', 'general'
] as const;

export const NOTIFICATION_PRIORITIES = [
  'low', 'medium', 'high', 'critical'
] as const;

export const NOTIFICATION_TYPES = [
  'advisory', 'notification', 'alert', 'update'
] as const;