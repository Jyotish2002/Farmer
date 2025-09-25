# Farmer Assistant - Setup Guide

This guide will help you set up and run the complete Farmer Assistant application.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** - [Download](https://git-scm.com/)

### API Keys Required
1. **Google OAuth2 Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth2 credentials
   - Add authorized redirect URIs

2. **OpenWeather API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your free API key

3. **Google Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create API key for Gemini

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd farmer-assistant
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env file with your configurations
# Update the following values:
# - MONGODB_URI
# - JWT_SECRET (generate a secure random string)
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - OPENWEATHER_API_KEY
# - GEMINI_API_KEY
```

### 3. Frontend Setup

```bash
# Navigate to frontend folder (from root)
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env file with your API URL
# REACT_APP_API_URL=http://localhost:5000
```

### 4. ML API Setup

```bash
# Navigate to ml-api folder (from root)
cd ml-api

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env
```

### 5. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. The database will be created automatically

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in backend .env file

## Running the Application

### Start all services (recommended order):

1. **Start MongoDB** (if using local installation)

2. **Start ML API**
```bash
cd ml-api
# Activate virtual environment if created
python main.py
# API will run on http://localhost:8000
```

3. **Start Backend API**
```bash
cd backend
npm run dev
# API will run on http://localhost:5000
```

4. **Start Frontend**
```bash
cd frontend
npm start
# Application will open on http://localhost:3000
```

## Verification

### Test the Setup:

1. **ML API**: Visit http://localhost:8000/docs to see API documentation
2. **Backend API**: Visit http://localhost:5000/health for health check
3. **Frontend**: Visit http://localhost:3000 to access the application
4. **Authentication**: Try logging in with Google OAuth

## Default Admin Setup

To create an admin user:
1. Log in with Google OAuth first (this creates a farmer account)
2. Manually update the user's role in MongoDB:
   ```javascript
   // In MongoDB shell or Compass
   db.users.updateOne(
     { email: "your-email@gmail.com" },
     { $set: { role: "admin" } }
   )
   ```

## Project Structure

```
farmer-assistant/
├── backend/          # Node.js/Express API
├── frontend/         # React.js application  
├── ml-api/          # Python FastAPI ML service
├── shared/          # Shared types and utilities
└── README.md        # Main documentation
```

## Environment Variables Summary

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farmer-assistant
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENWEATHER_API_KEY=your-openweather-key
GEMINI_API_KEY=your-gemini-key
ML_API_URL=http://localhost:8000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### ML API (.env)
```
PORT=8000
ENVIRONMENT=development
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string format
   - Verify network connectivity for Atlas

2. **Google OAuth Not Working**
   - Verify OAuth2 credentials
   - Check authorized redirect URIs
   - Ensure frontend and backend URLs match

3. **ML API Import Errors**
   - Activate virtual environment
   - Install all requirements
   - Check Python version compatibility

4. **CORS Issues**
   - Verify backend CORS configuration
   - Check frontend API URL configuration

## Production Deployment

For production deployment:

1. **Security**: Change all default secrets and keys
2. **Database**: Use MongoDB Atlas or secure MongoDB instance
3. **Environment**: Set NODE_ENV=production
4. **HTTPS**: Enable SSL/TLS certificates
5. **Domain**: Update OAuth redirect URIs for your domain

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review error logs in terminal/console
3. Check API documentation at /docs endpoints
4. Verify all environment variables are set correctly

## License

This project is licensed under the MIT License.