// API Response Types
export interface WeatherData {
  location: {
    name: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  temperature: {
    current: number;
    feels_like: number;
    min: number;
    max: number;
  };
  humidity: number;
  pressure: number;
  wind: {
    speed: number;
    direction: number;
  };
  visibility: number;
  clouds: number;
  timestamp: number;
}

export interface Notification {
  _id: string;
  title: string;
  content: string;
  type: 'advisory' | 'notification' | 'alert' | 'update';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'weather' | 'crop' | 'pest' | 'market' | 'policy' | 'general';
  postedBy: {
    _id: string;
    name: string;
    role: string;
  };
  isActive: boolean;
  expiresAt?: string;
  targetAudience: 'all' | 'farmers' | 'admins';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'farmer' | 'admin';
  location?: string;
  farmSize?: number;
  crops?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CropRecommendation {
  recommended_crop: string;
  confidence: number;
  alternatives: string[];
}

export interface YieldPrediction {
  predicted_yield: number;
  expected_profit: number;
  confidence: number;
}

export interface PestAnalysis {
  analysis: string;
  image_processed: boolean;
  timestamp: string;
}

export interface ChatbotResponse {
  reply: string;
  timestamp: string;
}

// Request Types
export interface CropRecommendationRequest {
  soilPh: number;
  temperature: number;
  rainfall: number;
}

export interface YieldPredictionRequest {
  cropType: string;
  area: number;
  inputCost: number;
}

export interface ChatbotRequest {
  message: string;
  context?: string;
}

export interface NotificationRequest {
  title: string;
  content: string;
  type?: 'advisory' | 'notification' | 'alert' | 'update';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'weather' | 'crop' | 'pest' | 'market' | 'policy' | 'general';
  expiresAt?: string;
  targetAudience?: 'all' | 'farmers' | 'admins';
}