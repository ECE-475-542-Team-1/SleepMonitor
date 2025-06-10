import mongoose from 'mongoose';

const SensorReadingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'SleepSession' },
  timestamp: Number, // or Date
  hr: { type: Number, required: false },
  spo2: { type: Number, required: false },
  respiratoryRate: { type: Number, required: false },
  movementRate: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SensorReading ||
  mongoose.model('SensorReading', SensorReadingSchema);
