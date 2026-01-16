const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  subject: { type: String, default: 'general' }, // e.g., 'web-dev', 'programming', 'science'
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  isActive: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String }],
      correctAnswer: { type: String, required: true },
    }
  ],
  createdByAI: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
