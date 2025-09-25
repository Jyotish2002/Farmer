# Farmer Assistant ML API

This is the Machine Learning API service for the Farmer Assistant application. It provides endpoints for crop recommendation and yield prediction using trained ML models.

## Features

- **Crop Recommendation**: Recommends suitable crops based on soil pH, temperature, and rainfall
- **Yield Prediction**: Predicts crop yield and expected profit based on crop type, area, and input cost
- **FastAPI Framework**: Modern, fast web framework with automatic API documentation
- **Input Validation**: Comprehensive input validation using Pydantic models

## API Endpoints

### Health Check
- `GET /` - API information
- `GET /health` - Health status check

### ML Predictions
- `POST /predict/crop` - Get crop recommendations
- `POST /predict/yield` - Predict yield and profit
- `GET /models/info` - Get information about available models

## Setup

1. Install Python 3.8+ and pip
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the API:
   ```bash
   python main.py
   ```
   Or using uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Documentation

Once the server is running, visit:
- Interactive API docs: http://localhost:8000/docs
- ReDoc documentation: http://localhost:8000/redoc

## Input Formats

### Crop Recommendation
```json
{
  "soil_ph": 6.5,
  "temperature": 25.0,
  "rainfall": 1200.0
}
```

### Yield Prediction
```json
{
  "crop_type": "Rice",
  "area": 2.5,
  "input_cost": 50000.0
}
```

## Supported Crops

- Rice
- Wheat  
- Maize
- Cotton
- Sugarcane
- Potato
- Tomato
- Onion

## Note

This implementation uses mock ML models for demonstration purposes. In a production environment, replace these with actual trained models using real agricultural datasets.

## Docker Deployment (Optional)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```