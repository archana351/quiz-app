const mongoose = require('mongoose');

const { Schema } = mongoose;

const answerSchema = new Schema({
	questionId: { type: Schema.Types.ObjectId, required: true },
	selectedOption: { type: String, required: true },
}, { _id: false });

const quizAttemptSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
	answers: [answerSchema],
	correctCount: { type: Number, required: true },
	wrongCount: { type: Number, required: true },
	copyCount: { type: Number, default: 0 },
	tabSwitchCount: { type: Number, default: 0 },
	timeTaken: { type: Number, required: true }, // seconds
	cheatingPercentage: { type: Number, default: 0, min: 0, max: 100 }, // 0-100 ML cheating probability
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
