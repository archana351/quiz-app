import sys
import joblib
import numpy as np

# Load trained model
model = joblib.load("cheating_model.pkl")

# Read input values from command line
copyCount = int(sys.argv[1])
tabSwitchCount = int(sys.argv[2])
timeSpent = float(sys.argv[3])
score = float(sys.argv[4])

# Get probability prediction instead of binary classification
X = np.array([[copyCount, tabSwitchCount, timeSpent, score]])
probability = model.predict_proba(X)[0][1]

# Output probability as percentage
print(f"{probability:.2f}")
