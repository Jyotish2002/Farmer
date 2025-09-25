# Shared utilities and configurations

## API Constants
API_ENDPOINTS = {
    'weather': '/api/weather',
    'notifications': '/api/notifications',
    'crop_recommendation': '/api/crop-recommendation',
    'yield_prediction': '/api/yield-prediction',
    'pest_detection': '/api/pest-detection',
    'chatbot': '/api/chatbot',
    'auth': '/auth',
    'admin': '/api/admin'
}

# Crop types supported by the system
SUPPORTED_CROPS = [
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 
    'Potato', 'Tomato', 'Onion', 'Soybean', 'Groundnut', 
    'Barley', 'Millet'
]

# Validation ranges
VALIDATION_RANGES = {
    'soil_ph': {'min': 0, 'max': 14},
    'temperature': {'min': -50, 'max': 60},
    'rainfall': {'min': 0, 'max': 5000},
    'area': {'min': 0.1, 'max': 10000},
    'input_cost': {'min': 0, 'max': 10000000}
}

# Notification categories
NOTIFICATION_CATEGORIES = [
    'weather', 'crop', 'pest', 'market', 'policy', 'general'
]

NOTIFICATION_PRIORITIES = [
    'low', 'medium', 'high', 'critical'
]

NOTIFICATION_TYPES = [
    'advisory', 'notification', 'alert', 'update'
]