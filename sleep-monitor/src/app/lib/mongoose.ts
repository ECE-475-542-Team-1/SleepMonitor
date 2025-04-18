import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error('Missing MONGO_URI env variable');
  }

  await mongoose.connect(process.env.MONGO_URI, {
  });

  isConnected = true;
  console.log('MongoDB connected');
}
