# Online Quiz System

A MERN stack web application for creating and taking quizzes with built-in cheating detection using machine learning.

---

## Features

### For Teachers
- Create quizzes with multiple choice questions
- Manage quiz status (draft, active, closed)
- View all quizzes created by you
- Delete quizzes
- View detailed results of student quiz attempts
- See cheating detection scores for each student attempt

### For Students
- View available quizzes
- Take quizzes and submit answers
- Get instant result feedback (correct/wrong count)
- View quiz attempt history and results
- See your cheating detection score

### Cheating Detection
Machine learning model (Logistic Regression) analyzes student behavior:
- **Copy Count** - Detects copy-paste actions during quiz
- **Tab Switch Count** - Counts how many times student left the quiz tab
- **Time Spent** - Records total time to complete the quiz
- **Score** - Student's performance on the quiz
- **Output** - Cheating probability (0-100%)

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React.js, Axios, React Router |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | MongoDB, Mongoose |
| **ML Model** | Python, scikit-learn (Logistic Regression) |
| **Authentication** | JWT, bcryptjs |
| **Real-time** | Socket.IO (quiz availability updates) |

---

## Project Structure

```
quiz-builder/
├── frontend/                    # React app
│   ├── src/
│   │   ├── pages/             # Login, Register, Dashboard, AttemptQuiz, QuizResults, etc.
│   │   ├── components/        # Reusable components (Input, QuizCard, etc.)
│   │   ├── api/               # API calls (authApi.js, quizApi.js)
│   │   ├── context/           # Context providers
│   │   ├── services/          # Business logic services
│   │   └── styles/            # CSS files
│   └── package.json
│
├── backend/                     # Node.js server
│   ├── src/
│   │   ├── controllers/       # Auth, Quiz, QuizAttempt controllers
│   │   ├── models/            # User, Quiz, QuizAttempt schemas
│   │   ├── routes/            # Auth, Quiz, QuizAttempt routes
│   │   ├── middleware/        # JWT auth, role authorization
│   │   ├── services/          # Business logic (AI quiz service)
│   │   ├── utils/             # Utilities (AI service, OpenAI)
│   │   ├── config/            # Database config
│   │   ├── app.js             # Express app setup
│   │   └── socketHandler.js   # WebSocket handlers
│   ├── server.js              # Server entry point
│   └── package.json
│
└── ml/                          # Python ML module
    ├── train_model.py         # Train Logistic Regression model
    ├── predict_cheating.py    # Predict cheating probability
    └── cheating_data.csv      # Training data
```

---

## Installation & Setup

### Prerequisites
- Node.js v14+
- Python v3.8+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file with:
# MONGO_URI=mongodb://localhost:27017/quiz-builder
# JWT_SECRET=your_jwt_secret_here
# PORT=5000

npm start
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
# App opens on http://localhost:3000
```

### ML Model Setup

```bash
cd ml
pip install pandas scikit-learn joblib

# Train the model (one-time setup)
python train_model.py
# Creates cheating_model.pkl

# To test predictions:
python predict_cheating.py <copyCount> <tabSwitchCount> <timeSpent> <score>
# Example: python predict_cheating.py 5 3 120 75
```

---

## User Roles & Authentication

### Registration & Login
- User can register as **Teacher** or **Student**
- Password is hashed using bcryptjs
- Login returns JWT token for authentication

### Role-Based Access
- **Teacher**: Can create, manage quizzes, and view student results
- **Student**: Can take quizzes and view own results

---

## How It Works

### 1. Quiz Creation (Teacher)
- Teacher creates a new quiz with title, topic, difficulty level
- Adds multiple choice questions with options and correct answers
- Quiz status starts as "draft"
- Teacher can set quiz to "active" when ready for students

### 2. Taking a Quiz (Student)
- Student views available active quizzes
- Clicks to join and start the quiz
- System tracks:
  - Copy-paste events (copyCount)
  - Tab switches (tabSwitchCount)
  - Time taken (timeTaken in seconds)
- Student submits answers when finished

### 3. Results & Cheating Detection
- System calculates correct/wrong count
- Sends student data to Python ML model:
  ```
  Input: [copyCount, tabSwitchCount, timeSpent, score]
  Output: Cheating probability (0-100%)
  ```
- Results displayed: score, correct/wrong count, cheating percentage

### 4. Teacher Review
- Teacher can view all student attempts on a quiz
- See each student's score and cheating detection percentage
- Identify suspicious attempts for manual review

---

## API Endpoints

### Authentication
```
POST /api/auth/register    - Register new user (teacher/student)
POST /api/auth/login       - Login user
```

### Quizzes
```
GET  /api/quizzes          - Get all active quizzes
POST /api/quizzes          - Create new quiz (teacher only)
GET  /api/quizzes/my-quizzes     - Get quizzes created by logged-in teacher
POST /api/quizzes/join     - Student joins quiz by ID
PATCH /api/quizzes/:quizId/start - Start quiz (teacher only)
PATCH /api/quizzes/:quizId/end   - Close quiz (teacher only)
DELETE /api/quizzes/:quizId      - Delete quiz (teacher only)
```

### Quiz Attempts
```
POST /api/quiz-attempts            - Start a quiz attempt
POST /api/quizzes/:quizId/submit   - Submit quiz answers and get results
```

---

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "teacher" | "student",
  createdAt: Date
}
```

### Quiz
```javascript
{
  title: String,
  topic: String,
  subject: String,
  difficulty: "easy" | "medium" | "hard",
  isActive: Boolean,
  status: "draft" | "active" | "closed",
  createdBy: User ObjectId,
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String
    }
  ],
  createdByAI: Boolean,
  timestamps: true
}
```

### QuizAttempt
```javascript
{
  userId: User ObjectId,
  quizId: Quiz ObjectId,
  answers: [
    {
      questionId: ObjectId,
      selectedOption: String
    }
  ],
  correctCount: Number,
  wrongCount: Number,
  copyCount: Number,
  tabSwitchCount: Number,
  timeTaken: Number (seconds),
  cheatingPercentage: Number (0-100),
  createdAt: Date
}
```

---

## Security

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (RBAC)
- ✅ CORS enabled for frontend-backend communication
- ✅ Protected routes require authentication

---

## Machine Learning Model Details

### Algorithm
- **Model Type**: Logistic Regression
- **Framework**: scikit-learn
- **Input Features**: 4 behavioral metrics
- **Output**: Probability of cheating (0-1, displayed as 0-100%)

### Training
```bash
python train_model.py
# Reads: cheating_data.csv
# Outputs: cheating_model.pkl
# Uses 80% training, 20% test data
```

### Prediction
```bash
python predict_cheating.py 5 3 120 75
# copyCount=5, tabSwitchCount=3, timeSpent=120s, score=75
# Returns: probability value (e.g., 0.75 = 75% cheating risk)
```

---

## Frontend Pages

| Page | Route | Users | Purpose |
|------|-------|-------|---------|
| Home | / | All | Landing page |
| Login | /login | All | User login |
| Register | /register | All | User registration |
| Dashboard | /dashboard | Both | Quiz list and general dashboard |
| Attempt Quiz | /attempt-quiz | Students | Take a quiz |
| Quiz Results | /quiz-results | Students | View attempt results |
| Teacher Dashboard | /teacher | Teachers | Create & manage quizzes |
| Teacher Results | /teacher/results/:quizId | Teachers | View student attempts |
| Student Dashboard | /student | Students | View quiz history |

---

## Workflow Example

1. **Teacher registers** → Creates quiz with 5 multiple choice questions
2. **Quiz set to active** → Students can now see it
3. **Student registers** → Joins the quiz
4. **Student takes quiz** → System logs copy events and tab switches
5. **Student submits** → Backend calculates score and calls Python ML model
6. **Results shown** → Student sees score + cheating percentage
7. **Teacher review** → Views all student results with cheating detection scores

---

## Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz-builder
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

---

## Running the Project

### Development

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

**Terminal 3 - ML (if needed):**
```bash
cd ml
python train_model.py
```

The app will open at http://localhost:3000

---

## License

MIT License

---

**An educational quiz platform built with modern web and machine learning technologies.**
