# Farmer Assistant MERN Website - (Krishi Sahayi)

A comprehensive full-stack MERN application designed to assist farmers with crop management, pest detection, yield prediction, and government advisories using AI and ML technologies.

## Features

### Authentication
- Google OAuth2 (Gmail) login/registration
- JWT-based route protection
- Farmer profile storage in MongoDB

### Dashboard
- Real-time weather data (OpenWeather API)
- Government notifications & advisories display

### Crop Recommendation
- ML-based crop recommendation using soil pH, temperature, and rainfall data
- Python Flask/FastAPI backend for ML models

### Yield Prediction
- Predict crop yield and expected profit
- Input: crop type, area, input cost

### Pest Detection
- Image upload for crop/pest analysis
- Gemini Vision API integration
- Returns pest/disease name, cause, treatment, and prevention tips

### AI Chatbot
- Integrated chatbot in dashboard
- Gemini Text API for farmer queries
- Agricultural advice and recommendations

### Admin Panel
- Government officials can post advisories and notifications
- Separate authentication for admin users

## Tech Stack

### Frontend
- React.js
- TailwindCSS
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Google OAuth2 with Passport.js
- JWT authentication

### ML Services
- Python Flask/FastAPI
- Machine Learning models for crop recommendation and yield prediction
- Gemini API integration (Vision and Text)

## Project Structure

```
farmer-assistant/
├── frontend/          # React.js frontend
├── backend/           # Node.js/Express backend
├── ml-api/           # Python ML API service
├── shared/           # Shared utilities and types
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB
- Google OAuth2 credentials
- OpenWeather API key
- Gemini API key

### Installation

1. Clone the repository
2. Set up environment variables (see .env.example files)
3. Install dependencies for each service
4. Start MongoDB
5. Run the services

## API Endpoints

### Backend API
- `POST /auth/google` - Google OAuth authentication
- `GET /api/weather` - Get weather data
- `GET /api/notifications` - Get government notifications
- `POST /api/crop-recommendation` - Get crop recommendations
- `POST /api/yield-prediction` - Predict yield and profit
- `POST /api/pest-detection` - Analyze pest images
- `POST /api/chatbot` - AI chatbot queries

### ML API
- `POST /predict/crop` - Crop recommendation
- `POST /predict/yield` - Yield prediction

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
