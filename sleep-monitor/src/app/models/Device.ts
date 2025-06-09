// models/Device.ts
import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  apiKey: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String }, // optional device name 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Device || mongoose.model('Device', deviceSchema);
