from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import uvicorn

# --- 1. Initialize the FastAPI application ---
app = FastAPI(title="Crop Recommendation API", version="1.0.0")

# Allow all origins for development (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Load Your Trained Model ---
# This loads the .joblib file you created in Colab
try:
    model = joblib.load('models/crop_recommendation_model.joblib')
    print(f"Model loaded successfully: {type(model)}")
except FileNotFoundError:
    print("FATAL: Model file not found at 'models/crop_recommendation_model.joblib'")
    model = None

# --- 3. Define the structure of the incoming request data ---
# This tells the API what data to expect. It must match your model's features.
class CropRecommendationRequest(BaseModel):
    N: int
    P: int
    K: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# --- 4. Define the structure of the response data ---
class CropRecommendationResponse(BaseModel):
    recommended_crop: str

# --- 5. Create the API endpoint for prediction ---
@app.post("/recommend", response_model=CropRecommendationResponse)
async def recommend_crop(request: CropRecommendationRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    try:
        # Create a pandas DataFrame from the request data
        # The column order MUST be the same as the one used for training
        # Create a pandas DataFrame from the request data
        # The column order MUST be the same as the one used for training
        input_data = pd.DataFrame([[
            request.N, request.P, request.K,
            request.temperature, request.humidity,
            request.ph, request.rainfall
        ]], columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])

        print(f"Input data: {input_data.to_dict('records')[0]}")

        # Use the loaded model to make a prediction
        prediction = model.predict(input_data)
        recommended_crop = prediction[0]

        print(f"Model prediction: {prediction}")
        print(f"Recommended crop: {recommended_crop}")

        # Return the prediction in the response
        return CropRecommendationResponse(recommended_crop=recommended_crop)

    except Exception as e:
        # If anything goes wrong, return an error
        raise HTTPException(status_code=500, detail=str(e))

# --- 6. Define a simple root endpoint for checking if the API is running ---
@app.get("/")
async def root():
    return {"message": "Crop Recommendation API is running."}

# --- 7. Run the API server when the script is executed ---
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)