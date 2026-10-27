const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chat_clone_db', {
      serverSelectionTimeoutMS: 3000 // Quick timeout if MongoDB is not running locally
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed MongoDB demo data if empty
    const dbStore = require('../store/dbStore');
    await dbStore.seedMongoData();

  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}`);
    console.log(`Running server with In-Memory / Hybrid storage fallback. MongoDB URI can be updated in server/.env when needed.`);
    isConnected = false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
