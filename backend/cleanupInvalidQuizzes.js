// ==========================
// cleanupInvalidQuizzes.js
// ==========================
// Script to delete invalid quizzes from MongoDB
// Run with: node cleanupInvalidQuizzes.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quiz = require('./src/models/Quiz');

// Load environment variables
dotenv.config();

// Allowed topics list (lowercase for comparison)
const ALLOWED_TOPICS = [
  'javascript',
  'react',
  'python',
  'java',
  'nodejs',
  'html',
  'css',
  'mongodb',
  'sql',
  'machine learning',
  'artificial intelligence',
  'blockchain'
];

// Function to check if a topic is invalid
const isInvalidTopic = (topic) => {
  if (!topic) return true;
  
  const topicLower = topic.toLowerCase().trim();
  
  // Rule 1: Topic length < 4
  if (topicLower.length < 4) {
    return true;
  }
  
  // Rule 2: Topic NOT in allowed list
  if (!ALLOWED_TOPICS.includes(topicLower)) {
    return true;
  }
  
  return false;
};

// Main cleanup function
const cleanupInvalidQuizzes = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB successfully\n');

    // Fetch all quizzes
    console.log('Fetching all quizzes...');
    const allQuizzes = await Quiz.find({});
    console.log(`Found ${allQuizzes.length} total quizzes\n`);

    // Find invalid quizzes
    const invalidQuizzes = allQuizzes.filter(quiz => isInvalidTopic(quiz.topic));
    
    if (invalidQuizzes.length === 0) {
      console.log('✓ No invalid quizzes found. Database is clean!');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Display invalid quizzes
    console.log(`Found ${invalidQuizzes.length} invalid quizzes:\n`);
    invalidQuizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ID: ${quiz._id}`);
      console.log(`   Title: ${quiz.title}`);
      console.log(`   Topic: "${quiz.topic}"`);
      console.log(`   Reason: ${quiz.topic.length < 4 ? 'Topic too short' : 'Topic not in allowed list'}`);
      console.log('');
    });

    // Delete invalid quizzes
    console.log('Deleting invalid quizzes...');
    const invalidIds = invalidQuizzes.map(quiz => quiz._id);
    const result = await Quiz.deleteMany({ _id: { $in: invalidIds } });

    console.log(`\n✓ Successfully deleted ${result.deletedCount} invalid quizzes`);
    console.log(`✓ Remaining quizzes: ${allQuizzes.length - result.deletedCount}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
    console.log('Cleanup completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the cleanup
console.log('=== Quiz Cleanup Script ===\n');
cleanupInvalidQuizzes();
