import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AttemptQuiz from './pages/AttemptQuiz';
import QuizResults from './pages/QuizResults';
import TeacherDashboardAdmin from './pages/admin/TeacherDashboard';
import StudentDashboard from './pages/admin/StudentDashboard';
import TeacherQuizResults from './pages/TeacherQuizResults';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teacher" element={<TeacherDashboardAdmin />} />
          <Route path="/teacher/results/:quizId" element={<TeacherQuizResults />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/attempt-quiz" element={<AttemptQuiz />} />
          <Route path="/quiz-results" element={<QuizResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
