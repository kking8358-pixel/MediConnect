import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

// Register connection lifecycle listeners to avoid unhandled 'error' events
mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[MongoDB Atlas] Runtime Connection Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.warn('\n[MongoDB Atlas] [WARN] MONGODB_URI is not set in .env file.');
    console.warn('Please open .env and add your MongoDB Atlas connection string:');
    console.warn('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mediconnect?retryWrites=true&w=majority\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`\n[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB Atlas] Database Name: ${conn.connection.name}\n`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error('\n[MongoDB Atlas] [ERROR] Connection Error:', error.message);
    console.error('Checklist for MongoDB Atlas connection issues:');
    console.error('   1. IP Whitelist: Go to Atlas -> Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0).');
    console.error('   2. Credentials: Check your database user and password (escape special characters like @ or # in password).');
    console.error('   3. Network / DNS: Check your internet connection.\n');
    return false;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
