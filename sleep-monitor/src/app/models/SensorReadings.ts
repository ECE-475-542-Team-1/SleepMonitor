import mongoose from 'mongoose';

const SensorReadingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'SleepSession' },
  timestamp: Number, // or Date
  hr: Number,
  spo2: Number,
  respiratoryRate: Number,
  movementRate: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SensorReading ||
  mongoose.model('SensorReading', SensorReadingSchema);
