import mongoose from 'mongoose';
import { Ride } from '../db/models/Ride';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/setly';

async function deleteFallbackData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete all fallback rides
    console.log('🗑️  Removing fallback rides...');
    const ridesDeleted = await Ride.deleteMany({ isFallback: true });
    console.log(`   Deleted ${ridesDeleted.deletedCount} fallback rides\n`);

    console.log('✨ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error deleting fallback data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

deleteFallbackData();
