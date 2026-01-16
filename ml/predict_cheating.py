import sys
import joblib
import numpy as np

# Load trained model
model = joblib.load("cheating_model.pkl")

# Read inputs from Node.js
copyCount = float(sys.argv[1])
tabSwitchCount = float(sys.argv[2])
timeSpent = float(sys.argv[3])
score = float(sys.argv[4])

# Prepare input
X = np.array([[copyCount, tabSwitchCount, timeSpent, score]])

# Get probability prediction instead of binary classification
probability = model.predict_proba(X)[0][1]

# Output probability only (0-1 value)
print(probability)
