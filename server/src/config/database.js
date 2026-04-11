const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/global-allianz';
    const conn = await mongoose.connect(mongoUri);

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('🔧 Make sure MongoDB is running locally or set MONGODB_URI in your .env file.');
    process.exit(1);
  }
};

module.exports = connectDB;