import mongoose from 'mongoose';

const SleepSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionStart: Date,
  sessionEnd: Date,
  avgHeartRate: Number,
  avgSpo2: Number,
  sleepQualityScore: Number,
  respiratoryRate: Number,
  movementRate: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SleepSession ||
  mongoose.model('SleepSession', SleepSessionSchema);
