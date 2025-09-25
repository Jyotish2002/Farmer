from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import uvicorn
import os

app = FastAPI(title="Farmer Assistant ML API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class CropRecommendationRequest(BaseModel):
    soil_ph: float
    temperature: float
    rainfall: float

class CropRecommendationResponse(BaseModel):
    recommended_crop: str
    confidence: float
    alternatives: list

class YieldPredictionRequest(BaseModel):
    crop_type: str
    area: float
    input_cost: float

class YieldPredictionResponse(BaseModel):
    predicted_yield: float
    expected_profit: float
    confidence: float

# Mock ML models (in production, load actual trained models)
class MockCropRecommendationModel:
    def __init__(self):
        self.crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Tomato', 'Onion']
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit(self.crops)
    
    def predict(self, features):
        # Simple mock logic based on conditions
        ph, temp, rainfall = features[0]
        
        if 6.0 <= ph <= 7.5 and temp >= 20 and rainfall >= 1000:
            return 'Rice'
        elif 6.0 <= ph <= 7.0 and 15 <= temp <= 25 and 300 <= rainfall <= 1000:
            return 'Wheat'
        elif 5.8 <= ph <= 8.0 and temp >= 21 and rainfall >= 500:
            return 'Maize'
        elif 5.8 <= ph <= 8.0 and temp >= 18 and rainfall >= 400:
            return 'Cotton'
        else:
            return 'Wheat'  # Default recommendation
    
    def predict_alternatives(self, features):
        return ['Maize', 'Barley']

class MockYieldPredictionModel:
    def predict(self, features):
        crop_encoded, area, input_cost = features[0]
        
        # Mock yield calculation based on area and crop type
        base_yield_per_hectare = {
            'Rice': 4000, 'Wheat': 3000, 'Maize': 5000, 'Cotton': 500,
            'Sugarcane': 70000, 'Potato': 25000, 'Tomato': 40000, 'Onion': 20000
        }
        
        # Simple yield calculation
        avg_yield = base_yield_per_hectare.get('Rice', 3000)  # Default
        predicted_yield = avg_yield * area * np.random.uniform(0.8, 1.2)
        
        return predicted_yield

# Initialize models
crop_model = MockCropRecommendationModel()
yield_model = MockYieldPredictionModel()

@app.get("/")
async def root():
    return {"message": "Farmer Assistant ML API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/predict/crop", response_model=CropRecommendationResponse)
async def predict_crop(request: CropRecommendationRequest):
    try:
        # Validate input ranges
        if not (0 <= request.soil_ph <= 14):
            raise HTTPException(status_code=400, detail="Soil pH must be between 0 and 14")
        if not (-50 <= request.temperature <= 60):
            raise HTTPException(status_code=400, detail="Temperature must be between -50°C and 60°C")
        if not (0 <= request.rainfall <= 5000):
            raise HTTPException(status_code=400, detail="Rainfall must be between 0 and 5000mm")
        
        # Prepare features
        features = np.array([[request.soil_ph, request.temperature, request.rainfall]])
        
        # Predict crop
        recommended_crop = crop_model.predict(features)
        alternatives = crop_model.predict_alternatives(features)
        
        # Mock confidence score
        confidence = np.random.uniform(0.75, 0.95)
        
        return CropRecommendationResponse(
            recommended_crop=recommended_crop,
            confidence=confidence,
            alternatives=alternatives
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/yield", response_model=YieldPredictionResponse)
async def predict_yield(request: YieldPredictionRequest):
    try:
        # Validate inputs
        if request.area <= 0:
            raise HTTPException(status_code=400, detail="Area must be greater than 0")
        if request.input_cost < 0:
            raise HTTPException(status_code=400, detail="Input cost cannot be negative")
        
        # Encode crop type (mock encoding)
        crop_types = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Tomato', 'Onion']
        if request.crop_type not in crop_types:
            raise HTTPException(status_code=400, detail=f"Unsupported crop type. Supported: {crop_types}")
        
        crop_encoded = crop_types.index(request.crop_type)
        
        # Prepare features
        features = np.array([[crop_encoded, request.area, request.input_cost]])
        
        # Predict yield
        predicted_yield = yield_model.predict(features)
        
        # Calculate expected profit (mock calculation)
        # Price per kg varies by crop
        price_per_kg = {
            'Rice': 25, 'Wheat': 20, 'Maize': 18, 'Cotton': 80,
            'Sugarcane': 3, 'Potato': 15, 'Tomato': 25, 'Onion': 20
        }
        
        crop_price = price_per_kg.get(request.crop_type, 20)
        expected_revenue = predicted_yield * crop_price
        expected_profit = expected_revenue - request.input_cost
        
        # Mock confidence
        confidence = np.random.uniform(0.7, 0.9)
        
        return YieldPredictionResponse(
            predicted_yield=round(predicted_yield, 2),
            expected_profit=round(expected_profit, 2),
            confidence=confidence
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/info")
async def get_model_info():
    return {
        "crop_recommendation": {
            "supported_crops": crop_model.crops,
            "input_features": ["soil_ph", "temperature", "rainfall"]
        },
        "yield_prediction": {
            "supported_crops": ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Tomato', 'Onion'],
            "input_features": ["crop_type", "area", "input_cost"]
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)