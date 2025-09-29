import joblib
import pandas as pd

# Load the model
model = joblib.load('models/crop_recommendation_model.joblib')
print(f"Model type: {type(model)}")

# Test with actual frontend values that cause muskmelon
test_cases = [
    {'N': 52, 'P': 26, 'K': 38, 'temperature': 26.0, 'humidity': 60.0, 'ph': 8.4, 'rainfall': 6.5},  # Actual frontend values
    {'N': 52, 'P': 26, 'K': 38, 'temperature': 26.0, 'humidity': 60.0, 'ph': 6.5, 'rainfall': 6.5},  # Same but normal pH
    {'N': 52, 'P': 26, 'K': 38, 'temperature': 26.0, 'humidity': 60.0, 'ph': 8.4, 'rainfall': 100},  # Same but normal rainfall
    {'N': 52, 'P': 26, 'K': 38, 'temperature': 26.0, 'humidity': 60.0, 'ph': 6.5, 'rainfall': 100},  # Normal pH and rainfall
    {'N': 52, 'P': 26, 'K': 38, 'temperature': 26.0, 'humidity': 60.0, 'ph': 7.0, 'rainfall': 50},   # Different values
]

for i, case in enumerate(test_cases):
    input_data = pd.DataFrame([list(case.values())], columns=list(case.keys()))
    prediction = model.predict(input_data)
    print(f"Test case {i+1}: {case} -> Prediction: {prediction[0]}")