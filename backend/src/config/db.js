const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-builder';

    const conn = await mongoose.connect(mongoURI);

    console.log(`✓ MongoDB connected successfully`);
    console.log(`  Host: ${conn.connection.host}`);
    console.log(`  Database: ${conn.connection.name}\n`);

    return conn;
  } catch (error) {
    console.error(`✗ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✓ Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
  console.log('✗ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('✗ MongoDB connection error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing connection:', error.message);
    process.exit(1);
  }
});

module.exports = connectDB;
