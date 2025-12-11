import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../db/models/User';
import dummyUsersData from '../data/dummy-users.json';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/setly';

interface DummyUserInput {
  name: string;
  email: string;
  password: string;
  photoUrl: string;
  phone?: string;
  bio?: string;
  headline?: string;
  city?: string;
  state?: string;
  university?: string;
  graduationYear?: number;
  major?: string;
  company?: string;
  title?: string;
  role: 'student' | 'professional';
  verificationBadge?: 'student' | 'alumni' | 'verified';
  languages?: string[];
  interests?: string[];
  gender?: string;
  nationality?: string;
}

async function seedDummyUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete existing dummy users (identified by email domain pattern or specific flag)
    console.log('🗑️  Removing existing dummy users...');
    const deleteResult = await User.deleteMany({
      userId: { $regex: /^dummy-user-/ }
    });
    console.log(`   Deleted ${deleteResult.deletedCount} existing dummy users\n`);

    console.log('👥 Creating 50 dummy users...\n');

    const usersToCreate = (dummyUsersData as DummyUserInput[]).map((userData, index) => {
      // Generate random creation date within last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const createdAt = new Date(
        sixMonthsAgo.getTime() + Math.random() * (Date.now() - sixMonthsAgo.getTime())
      );

      // Updated within last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const updatedAt = new Date(
        thirtyDaysAgo.getTime() + Math.random() * (Date.now() - thirtyDaysAgo.getTime())
      );

      return {
        userId: `dummy-user-${index + 1}`,
        email: userData.email,
        password: userData.password, // Will be hashed in pre-save hook
        name: userData.name,
        photoUrl: userData.photoUrl,
        phone: userData.phone,
        bio: userData.bio,
        headline: userData.headline,
        city: userData.city,
        state: userData.state,
        university: userData.university,
        graduationYear: userData.graduationYear,
        major: userData.major,
        company: userData.company,
        title: userData.title,
        role: userData.role,
        verified: true, // All dummy users are verified
        emailVerified: true,
        phoneVerified: !!userData.phone,
        verificationBadge: userData.verificationBadge,
        domainVerified: userData.email.includes('.edu') || ['google.com', 'amazon.com', 'meta.com', 'tesla.com', 'microsoft.com'].some(domain => userData.email.includes(domain)),
        domainType: userData.email.includes('.edu') ? 'university' : (userData.company ? 'company' : null),
        languages: userData.languages || [],
        interests: userData.interests || [],
        preferredCities: userData.city ? [userData.city] : [],
        savedRooms: [],
        savedRides: [],
        savedMarketplace: [],
        profileVisibility: {
          about: true,
          travelHistory: true,
          reviews: true,
          interests: true,
          connections: true,
          verification: true
        },
        createdAt,
        updatedAt,
        lastLoginAt: updatedAt, // Last login is recent
        isProfileComplete: true
      };
    });

    // Hash passwords before insertion
    console.log('🔐 Hashing passwords...');
    for (const user of usersToCreate) {
      (user as any).password = await bcrypt.hash((user as any).password, 10);
    }

    // Insert all users
    const insertedUsers = await User.insertMany(usersToCreate, { ordered: false });
    console.log(`✅ Successfully created ${insertedUsers.length} dummy users!\n`);

    // Display breakdown
    const students = insertedUsers.filter((u: any) => u.role === 'student').length;
    const professionals = insertedUsers.filter((u: any) => u.role === 'professional').length;

    console.log('📊 Breakdown:');
    console.log(`   👨‍🎓 Students: ${students}`);
    console.log(`   💼 Professionals: ${professionals}`);
    console.log('\n📧 All users have email: Setly2025!');
    console.log('   Example login: priya.sharma@northeastern.edu / Setly2025!\n');

    // Display universities represented
    const universities = [...new Set(insertedUsers
      .filter((u: any) => u.university)
      .map((u: any) => u.university))];
    console.log(`🎓 Universities represented: ${universities.length}`);
    universities.slice(0, 10).forEach(uni => console.log(`   - ${uni}`));
    if (universities.length > 10) console.log(`   ... and ${universities.length - 10} more`);

    // Display companies represented
    const companies = [...new Set(insertedUsers
      .filter((u: any) => u.company)
      .map((u: any) => u.company))];
    console.log(`\n🏢 Companies represented: ${companies.length}`);
    companies.forEach(company => console.log(`   - ${company}`));

    console.log('\n✨ Dummy users seeding complete!');

  } catch (error) {
    console.error('❌ Error seeding dummy users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDummyUsers();
