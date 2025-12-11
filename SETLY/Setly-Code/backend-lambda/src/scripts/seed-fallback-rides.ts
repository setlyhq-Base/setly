/**
 * Seed Fallback Rides Data to MongoDB
 * 
 * This script populates the MongoDB database with sample/fallback ride data
 * that appears when the Explore page has no real user-generated content.
 * 
 * Run with: npx tsx src/scripts/seed-fallback-rides.ts
 */

import { connectToDatabase } from '../db/connection';
import { Ride } from '../db/models';
import fallbackRidesData from '../data/fallback-rides.json';

const FALLBACK_USER_ID = 'fallback-user-rides';

async function seedFallbackRides() {
  try {
    console.log('🚀 Starting fallback rides seeding...\n');

    // Connect to database
    await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');

    // Delete existing fallback rides
    const deleteResult = await Ride.deleteMany({ isFallback: true });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing fallback rides\n`);

    // Calculate dynamic dates (today and upcoming days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ridesWithDynamicDates = fallbackRidesData.map((ride, index) => {
      // Distribute rides across today and next 7 days
      const daysOffset = index % 8; // 0-7 days from today
      const rideDate = new Date(today);
      rideDate.setDate(today.getDate() + daysOffset);

      // Update tags based on date
      let tags = [...(ride.tags || [])];
      
      // Remove 'today' tag if not today
      if (daysOffset !== 0) {
        tags = tags.filter(tag => tag !== 'today');
      } else if (!tags.includes('today')) {
        tags.push('today');
      }

      return {
        ...ride,
        rideDate: rideDate.toISOString(),
        tags
      };
    });

    // Insert fallback rides
    const insertedRides = await Ride.insertMany(ridesWithDynamicDates);
    console.log(`✅ Inserted ${insertedRides.length} fallback rides\n`);

    // Display category breakdown
    const categoryCounts = {
      nearby: insertedRides.filter(r => r.tags?.includes('nearby')).length,
      today: insertedRides.filter(r => r.tags?.includes('today')).length,
      shared: insertedRides.filter(r => r.tags?.includes('shared')).length,
      airport: insertedRides.filter(r => r.tags?.includes('airport')).length,
      'top-rated': insertedRides.filter(r => r.tags?.includes('top-rated')).length,
      driver: insertedRides.filter(r => r.type === 'driver').length,
      seeker: insertedRides.filter(r => r.type === 'seeker').length,
    };

    console.log('📊 Category Breakdown:');
    console.log(`   - Nearby: ${categoryCounts.nearby} rides`);
    console.log(`   - Today: ${categoryCounts.today} rides`);
    console.log(`   - Shared: ${categoryCounts.shared} rides`);
    console.log(`   - Airport: ${categoryCounts.airport} rides`);
    console.log(`   - Top Rated: ${categoryCounts['top-rated']} rides`);
    console.log(`   - Driver Posts: ${categoryCounts.driver}`);
    console.log(`   - Seeker Posts: ${categoryCounts.seeker}\n`);

    console.log('✅ Fallback rides seeding complete!\n');
    console.log('💡 These rides will appear in the Explore page when no real user posts exist.\n');
    console.log('🔄 Ride dates are dynamically set to today + next 7 days for freshness.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding fallback rides:', error);
    process.exit(1);
  }
}

// Run the seeder
seedFallbackRides();
