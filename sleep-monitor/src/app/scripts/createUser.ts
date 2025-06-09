// scripts/createUser.ts
import 'dotenv/config';        // loads .env
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/Users';
import { connectMongo } from '../lib/mongoose';

async function createUser(email: string, plainPassword: string, name = '') {
  try {

    await connectMongo();

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const newUser = await User.create({
      email,
      passwordHash,
      name,
    });

    console.log('User created:', newUser);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createUser('bach2690@yahoo.com', '123456', 'bach2690');
