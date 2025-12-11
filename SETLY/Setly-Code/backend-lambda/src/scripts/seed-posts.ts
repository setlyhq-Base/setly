import mongoose from 'mongoose';
import { Room } from '../db/models/Room';
import { Ride } from '../db/models/Ride';
import { MarketplaceItem } from '../db/models/MarketplaceItem';
import { User } from '../db/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/setly';

// Sample images from Unsplash for realistic posts
const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
  'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=800',
];

const MARKETPLACE_IMAGES = {
  furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=800',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800',
  ],
  electronics: [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
    'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800',
  ],
  books: [
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
  ],
  appliances: [
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    'https://images.unsplash.com/photo-1585659722983-3a675dabf07d?w=800',
  ],
};

async function seedPosts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all dummy users
    const users = await User.find({ userId: { $regex: /^dummy-user-/ } }).limit(50);
    if (users.length === 0) {
      console.error('❌ No dummy users found. Please run seed:dummy-users first.');
      process.exit(1);
    }
    console.log(`📊 Found ${users.length} dummy users\n`);

    // Delete existing seed posts
    console.log('🗑️  Removing existing seed posts...');
    const roomsDeleted = await Room.deleteMany({ roomId: { $regex: /^seed-room-/ } });
    const ridesDeleted = await Ride.deleteMany({ rideId: { $regex: /^seed-ride-/ } });
    const itemsDeleted = await MarketplaceItem.deleteMany({ itemId: { $regex: /^seed-item-/ } });
    console.log(`   Deleted ${roomsDeleted.deletedCount} rooms, ${ridesDeleted.deletedCount} rides, ${itemsDeleted.deletedCount} items\n`);

    // ===== SEED ROOMS =====
    console.log('🏠 Creating rooms...');
    
    const roomsData = [
      {
        title: 'Cozy Studio near Northeastern',
        description: 'Perfect for grad students! Walking distance to NEU campus. Quiet neighborhood, recently renovated. Includes all utilities.',
        city: 'Boston',
        state: 'MA',
        address: '123 Huntington Ave',
        zipCode: '02115',
        price: 1200,
        deposit: 1200,
        roomType: 'private',
        bathType: 'private',
        furnished: true,
        utilities: ['WiFi', 'Heat', 'Electric', 'Water'],
        amenities: ['In-unit laundry', 'Dishwasher', 'Gym'],
        university: 'Northeastern University',
      },
      {
        title: 'Shared 2BR in Allston',
        description: 'Looking for 1 roommate! Close to BU and Boston College. Great neighborhood with shops and restaurants nearby.',
        city: 'Boston',
        state: 'MA',
        address: '456 Commonwealth Ave',
        zipCode: '02134',
        price: 950,
        deposit: 950,
        roomType: 'shared',
        bathType: 'shared',
        furnished: false,
        utilities: ['WiFi', 'Heat'],
        amenities: ['Parking', 'Hardwood floors'],
        university: 'Boston University',
      },
      {
        title: 'Spacious Room in Brooklyn',
        description: 'NYU students welcome! Modern apartment in trendy Williamsburg. 15 min to campus by subway.',
        city: 'New York',
        state: 'NY',
        address: '789 Bedford Ave',
        zipCode: '11211',
        price: 1400,
        deposit: 1400,
        roomType: 'private',
        bathType: 'shared',
        furnished: true,
        utilities: ['WiFi', 'Heat', 'Hot water'],
        amenities: ['Roof deck', 'Elevator', 'Pet-friendly'],
        university: 'New York University',
      },
      {
        title: 'Student Housing near Rutgers',
        description: 'Perfect for Rutgers students. Safe neighborhood, walking distance to campus. Includes parking spot.',
        city: 'New Brunswick',
        state: 'NJ',
        address: '321 George St',
        zipCode: '08901',
        price: 800,
        deposit: 800,
        roomType: 'private',
        bathType: 'shared',
        furnished: false,
        utilities: ['WiFi', 'Heat', 'Electric'],
        amenities: ['Parking', 'Backyard', 'Storage'],
        university: 'Rutgers University',
      },
      {
        title: 'Modern Loft near MIT',
        description: 'Tech-friendly space for MIT/Harvard students. High-speed fiber internet, standing desk included.',
        city: 'Cambridge',
        state: 'MA',
        address: '555 Massachusetts Ave',
        zipCode: '02139',
        price: 1600,
        deposit: 1600,
        roomType: 'private',
        bathType: 'private',
        furnished: true,
        utilities: ['Fiber WiFi', 'Heat', 'Electric', 'Water'],
        amenities: ['In-unit laundry', 'Gym', 'Bike storage', '24/7 security'],
        university: 'MIT',
      },
      {
        title: 'Affordable Room in Ann Arbor',
        description: 'Great for UMich students! Close to campus and downtown. Friendly roommates, quiet study environment.',
        city: 'Ann Arbor',
        state: 'MI',
        address: '777 South University Ave',
        zipCode: '48104',
        price: 700,
        deposit: 700,
        roomType: 'shared',
        bathType: 'shared',
        furnished: false,
        utilities: ['WiFi', 'Heat', 'Water'],
        amenities: ['Parking', 'Study room', 'Backyard'],
        university: 'University of Michigan',
      },
      {
        title: 'Luxury Apartment in Palo Alto',
        description: 'Close to Stanford campus. Modern amenities, pool, gym. Perfect for grad students or young professionals.',
        city: 'Palo Alto',
        state: 'CA',
        address: '888 El Camino Real',
        zipCode: '94301',
        price: 2200,
        deposit: 2200,
        roomType: 'private',
        bathType: 'private',
        furnished: true,
        utilities: ['WiFi', 'Electric', 'Water', 'Gas'],
        amenities: ['Pool', 'Gym', 'Sauna', 'Concierge', 'Parking'],
        university: 'Stanford University',
      },
      {
        title: 'Cozy Studio in Austin',
        description: 'Perfect for UT students! Walking distance to campus. Vibrant neighborhood with great food scene.',
        city: 'Austin',
        state: 'TX',
        address: '999 Guadalupe St',
        zipCode: '78701',
        price: 1100,
        deposit: 1100,
        roomType: 'private',
        bathType: 'private',
        furnished: true,
        utilities: ['WiFi', 'AC', 'Electric', 'Water'],
        amenities: ['Pool', 'Gym', 'Parking'],
        university: 'University of Texas at Austin',
      },
      {
        title: 'Shared House near UCLA',
        description: 'Looking for 2 roommates! Westwood location, close to campus. Backyard, parking, great community.',
        city: 'Los Angeles',
        state: 'CA',
        address: '234 Westwood Blvd',
        zipCode: '90024',
        price: 1300,
        deposit: 1300,
        roomType: 'shared',
        bathType: 'shared',
        furnished: false,
        utilities: ['WiFi', 'Water', 'Trash'],
        amenities: ['Parking', 'Backyard', 'BBQ area'],
        university: 'UCLA',
      },
      {
        title: 'Bright Room in Seattle',
        description: 'Close to UW campus. Great for CS students working at nearby tech companies. Fast internet!',
        city: 'Seattle',
        state: 'WA',
        address: '567 University Way NE',
        zipCode: '98105',
        price: 1250,
        deposit: 1250,
        roomType: 'private',
        bathType: 'shared',
        furnished: true,
        utilities: ['Gigabit WiFi', 'Heat', 'Electric', 'Water'],
        amenities: ['In-unit laundry', 'Bike storage', 'Study nook'],
        university: 'University of Washington',
      },
      {
        title: 'Student Housing in Dallas',
        description: 'Perfect for UTD students! Close to campus shuttle. Quiet, safe neighborhood.',
        city: 'Dallas',
        state: 'TX',
        address: '432 Campbell Rd',
        zipCode: '75080',
        price: 850,
        deposit: 850,
        roomType: 'private',
        bathType: 'shared',
        furnished: false,
        utilities: ['WiFi', 'AC', 'Water'],
        amenities: ['Parking', 'Pool', 'Study room'],
        university: 'UT Dallas',
      },
      {
        title: 'Furnished Room in Tempe',
        description: 'ASU students welcome! Close to campus and Mill Avenue. Includes utilities and parking.',
        city: 'Tempe',
        state: 'AZ',
        address: '789 Apache Blvd',
        zipCode: '85281',
        price: 750,
        deposit: 750,
        roomType: 'shared',
        bathType: 'shared',
        furnished: true,
        utilities: ['WiFi', 'AC', 'Electric', 'Water'],
        amenities: ['Pool', 'Parking', 'Gym'],
        university: 'Arizona State University',
      },
      {
        title: 'Private Suite in San Francisco',
        description: 'Perfect for professionals working in tech. Close to Caltrain, walking distance to cafes and restaurants.',
        city: 'San Francisco',
        state: 'CA',
        address: '321 Market St',
        zipCode: '94102',
        price: 2400,
        deposit: 2400,
        roomType: 'private',
        bathType: 'private',
        furnished: true,
        utilities: ['WiFi', 'Heat', 'Electric', 'Water'],
        amenities: ['In-unit laundry', 'Dishwasher', 'Gym', 'Parking'],
      },
      {
        title: 'Spacious Room in Princeton',
        description: 'Graduate students preferred. Quiet study environment, walking distance to Princeton campus.',
        city: 'Princeton',
        state: 'NJ',
        address: '654 Nassau St',
        zipCode: '08540',
        price: 1350,
        deposit: 1350,
        roomType: 'private',
        bathType: 'shared',
        furnished: true,
        utilities: ['WiFi', 'Heat', 'Electric', 'Water'],
        amenities: ['Parking', 'Study room', 'Garden'],
        university: 'Princeton University',
      },
      {
        title: 'Modern Apartment in Chicago',
        description: 'Northwestern students welcome! Near campus and Lake Michigan. Newly renovated building.',
        city: 'Chicago',
        state: 'IL',
        address: '890 Sheridan Rd',
        zipCode: '60201',
        price: 1450,
        deposit: 1450,
        roomType: 'private',
        bathType: 'private',
        furnished: true,
        utilities: ['WiFi', 'Heat', 'Water'],
        amenities: ['Gym', 'Roof deck', 'Bike storage', 'Doorman'],
        university: 'Northwestern University',
      },
    ];

    const rooms = [];
    for (let i = 0; i < roomsData.length; i++) {
      const roomData = roomsData[i];
      const user = users[i % users.length];
      
      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      // Availability starts in 1-60 days
      const startDays = Math.floor(Math.random() * 60) + 1;
      const availabilityStart = new Date();
      availabilityStart.setDate(availabilityStart.getDate() + startDays);

      rooms.push({
        roomId: `seed-room-${i + 1}`,
        userId: user.userId,
        ...roomData,
        images: ROOM_IMAGES.slice(0, Math.floor(Math.random() * 3) + 2),
        rules: {
          vegetarian: Math.random() > 0.7,
          smoking: false,
          petsOk: Math.random() > 0.6,
        },
        availabilityStart,
        status: 'active',
        views: Math.floor(Math.random() * 50),
        createdAt,
        updatedAt: createdAt,
      });
    }

    await Room.insertMany(rooms);
    console.log(`✅ Created ${rooms.length} rooms\n`);

    // ===== SEED RIDES =====
    console.log('🚗 Creating rides...');
    
    const ridesData = [
      {
        type: 'driver',
        from: 'Boston, MA',
        to: 'New York, NY',
        pickupAddress: 'South Station, Boston',
        dropoffAddress: 'Penn Station, NYC',
        pickupLat: 42.3519,
        pickupLng: -71.0552,
        dropoffLat: 40.7506,
        dropoffLng: -73.9935,
        seatsAvailable: 3,
        pricePerSeat: 25,
        notes: 'Leaving Friday evening. Can stop for coffee/food. Split gas costs.',
      },
      {
        type: 'seeker',
        from: 'San Francisco, CA',
        to: 'Los Angeles, CA',
        pickupAddress: 'SFO Airport',
        dropoffAddress: 'LAX Airport',
        pickupLat: 37.6213,
        pickupLng: -122.3790,
        dropoffLat: 33.9416,
        dropoffLng: -118.4085,
        notes: 'Looking for ride this weekend. Flexible with times. Happy to split gas!',
      },
      {
        type: 'driver',
        from: 'Seattle, WA',
        to: 'Portland, OR',
        pickupAddress: 'University of Washington',
        dropoffAddress: 'Downtown Portland',
        pickupLat: 47.6553,
        pickupLng: -122.3035,
        dropoffLat: 45.5152,
        dropoffLng: -122.6784,
        seatsAvailable: 2,
        pricePerSeat: 20,
        notes: 'Going for weekend trip. Leaving Saturday morning 8AM.',
      },
      {
        type: 'driver',
        from: 'Austin, TX',
        to: 'Dallas, TX',
        pickupAddress: 'UT Austin Campus',
        dropoffAddress: 'Downtown Dallas',
        pickupLat: 30.2849,
        pickupLng: -97.7341,
        dropoffLat: 32.7767,
        dropoffLng: -96.7970,
        seatsAvailable: 3,
        pricePerSeat: 15,
        notes: 'Thanksgiving break ride. Leaving Wednesday evening.',
      },
      {
        type: 'seeker',
        from: 'Philadelphia, PA',
        to: 'Washington DC',
        pickupAddress: 'UPenn Campus',
        dropoffAddress: 'Union Station DC',
        pickupLat: 39.9522,
        pickupLng: -75.1932,
        dropoffLat: 38.8977,
        dropoffLng: -77.0063,
        notes: 'Need ride for interview. Can leave early morning. Happy to contribute gas money.',
      },
      {
        type: 'driver',
        from: 'Cambridge, MA',
        to: 'Providence, RI',
        pickupAddress: 'MIT Campus',
        dropoffAddress: 'Brown University',
        pickupLat: 42.3601,
        pickupLng: -71.0942,
        dropoffLat: 41.8268,
        dropoffLng: -71.4025,
        seatsAvailable: 2,
        pricePerSeat: 12,
        notes: 'Regular weekend trips. Can pick up from MIT, Harvard, or Northeastern.',
      },
      {
        type: 'driver',
        from: 'Los Angeles, CA',
        to: 'San Diego, CA',
        pickupAddress: 'UCLA Campus',
        dropoffAddress: 'UCSD Campus',
        pickupLat: 34.0689,
        pickupLng: -118.4452,
        dropoffLat: 32.8801,
        dropoffLng: -117.2340,
        seatsAvailable: 3,
        pricePerSeat: 18,
        notes: 'Beach weekend! Leaving Friday afternoon, returning Sunday evening.',
      },
      {
        type: 'seeker',
        from: 'Chicago, IL',
        to: 'Milwaukee, WI',
        pickupAddress: 'Northwestern University',
        dropoffAddress: 'Downtown Milwaukee',
        pickupLat: 42.0565,
        pickupLng: -87.6753,
        dropoffLat: 43.0389,
        dropoffLng: -87.9065,
        notes: 'Need ride for concert this weekend. Flexible with pickup location.',
      },
      {
        type: 'driver',
        from: 'Atlanta, GA',
        to: 'Nashville, TN',
        pickupAddress: 'Georgia Tech',
        dropoffAddress: 'Vanderbilt University',
        pickupLat: 33.7756,
        pickupLng: -84.3963,
        dropoffLat: 36.1447,
        dropoffLng: -86.8027,
        seatsAvailable: 2,
        pricePerSeat: 22,
        notes: 'Music City trip! Leaving Friday evening.',
      },
      {
        type: 'driver',
        from: 'Durham, NC',
        to: 'Charlotte, NC',
        pickupAddress: 'Duke University',
        dropoffAddress: 'Charlotte Airport',
        pickupLat: 36.0014,
        pickupLng: -78.9382,
        dropoffLat: 35.2140,
        dropoffLng: -80.9431,
        seatsAvailable: 3,
        pricePerSeat: 15,
        notes: 'Airport run. Can pick up from Duke or UNC.',
      },
    ];

    const rides = [];
    for (let i = 0; i < ridesData.length; i++) {
      const rideData = ridesData[i];
      const user = users[(i + 5) % users.length];
      
      // Random date within next 14 days
      const daysAhead = Math.floor(Math.random() * 14) + 1;
      const rideDate = new Date();
      rideDate.setDate(rideDate.getDate() + daysAhead);
      
      const hour = Math.floor(Math.random() * 10) + 8; // 8 AM - 6 PM
      const departureTime = `${hour.toString().padStart(2, '0')}:00`;
      const arrivalTime = rideData.type === 'driver' ? `${(hour + 2).toString().padStart(2, '0')}:00` : undefined;

      // Post created 1-10 days ago
      const postDaysAgo = Math.floor(Math.random() * 10) + 1;
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - postDaysAgo);

      const tags = [];
      if (daysAhead === 1) tags.push('today');
      if (daysAhead <= 3) tags.push('nearby');
      if (rideData.seatsAvailable && rideData.seatsAvailable > 1) tags.push('shared');
      if (rideData.to.includes('Airport') || rideData.from.includes('Airport')) tags.push('airport');

      rides.push({
        rideId: `seed-ride-${i + 1}`,
        userId: user.userId,
        ...rideData,
        rideDate,
        departureTime,
        arrivalTime,
        user: {
          name: user.name,
          avatar: user.photoUrl,
          online: Math.random() > 0.5,
        },
        tags,
        isFallback: false,
        status: 'active',
        views: Math.floor(Math.random() * 30),
        createdAt,
        updatedAt: createdAt,
      });
    }

    await Ride.insertMany(rides);
    console.log(`✅ Created ${rides.length} rides\n`);

    // ===== SEED MARKETPLACE =====
    console.log('🛍️  Creating marketplace items...');
    
    const marketplaceData = [
      {
        category: 'Furniture',
        title: 'Ikea Desk - Great Condition',
        description: 'Moving sale! White Ikea desk, barely used. Perfect for students. Includes desk lamp.',
        price: 80,
        condition: 'like-new',
        location: 'Boston, MA',
        images: MARKETPLACE_IMAGES.furniture,
      },
      {
        category: 'Electronics',
        title: 'iPad Air 2020 - 64GB',
        description: 'Excellent condition iPad with case and screen protector. Perfect for note-taking.',
        price: 350,
        condition: 'like-new',
        location: 'New York, NY',
        images: MARKETPLACE_IMAGES.electronics,
      },
      {
        category: 'Furniture',
        title: 'Comfortable Armchair',
        description: 'Cozy reading chair, neutral gray color. No stains or tears. Pick up only.',
        price: 60,
        condition: 'good',
        location: 'Cambridge, MA',
        images: MARKETPLACE_IMAGES.furniture,
      },
      {
        category: 'Books',
        title: 'CS Textbooks Bundle',
        description: 'Algorithms, Data Structures, and more. Perfect for CS majors. All like new.',
        price: 120,
        condition: 'like-new',
        location: 'Palo Alto, CA',
        images: MARKETPLACE_IMAGES.books,
      },
      {
        category: 'Electronics',
        title: 'MacBook Pro 13" 2019',
        description: 'Intel i5, 8GB RAM, 256GB SSD. Works perfectly. Includes charger and case.',
        price: 650,
        condition: 'good',
        location: 'Seattle, WA',
        images: MARKETPLACE_IMAGES.electronics,
      },
      {
        category: 'Appliances',
        title: 'Mini Fridge - Perfect for Dorm',
        description: 'Compact fridge, works great. Ideal for dorm room or small apartment.',
        price: 70,
        condition: 'good',
        location: 'Ann Arbor, MI',
        images: MARKETPLACE_IMAGES.appliances,
      },
      {
        category: 'Furniture',
        title: 'Twin Bed Frame with Mattress',
        description: 'Selling bed set. Mattress is clean and comfortable. Frame in excellent condition.',
        price: 150,
        condition: 'good',
        location: 'Los Angeles, CA',
        images: MARKETPLACE_IMAGES.furniture,
      },
      {
        category: 'Electronics',
        title: 'Beats Studio Headphones',
        description: 'Wireless, noise cancelling. Perfect for studying in library or commuting.',
        price: 140,
        condition: 'like-new',
        location: 'Austin, TX',
        images: MARKETPLACE_IMAGES.electronics,
      },
      {
        category: 'Books',
        title: 'Biology & Chemistry Textbooks',
        description: 'Pre-med textbooks. Barely used, no highlighting. Can sell separately.',
        price: 90,
        condition: 'like-new',
        location: 'Philadelphia, PA',
        images: MARKETPLACE_IMAGES.books,
      },
      {
        category: 'Appliances',
        title: 'Microwave - Black',
        description: 'Works perfectly, clean inside and out. Moving and can\'t take it with me.',
        price: 45,
        condition: 'good',
        location: 'Dallas, TX',
        images: MARKETPLACE_IMAGES.appliances,
      },
      {
        category: 'Electronics',
        title: 'Monitor 24" Full HD',
        description: 'Dell monitor, great for dual screen setup. HDMI and DisplayPort.',
        price: 120,
        condition: 'like-new',
        location: 'San Francisco, CA',
        images: MARKETPLACE_IMAGES.electronics,
      },
      {
        category: 'Furniture',
        title: 'Coffee Table - Wood',
        description: 'Solid wood coffee table. Some minor scratches but very sturdy.',
        price: 50,
        condition: 'good',
        location: 'Chicago, IL',
        images: MARKETPLACE_IMAGES.furniture,
      },
      {
        category: 'Electronics',
        title: 'Kindle Paperwhite',
        description: 'Perfect for students. Includes case. Battery lasts weeks!',
        price: 80,
        condition: 'like-new',
        location: 'Princeton, NJ',
        images: MARKETPLACE_IMAGES.electronics,
      },
      {
        category: 'Appliances',
        title: 'Coffee Maker - Keurig',
        description: 'Single-serve coffee maker. Great condition, cleaned regularly.',
        price: 35,
        condition: 'good',
        location: 'Atlanta, GA',
        images: MARKETPLACE_IMAGES.appliances,
      },
      {
        category: 'Furniture',
        title: 'Bookshelf - 5 Shelves',
        description: 'Tall bookshelf, holds lots of books. Easy to assemble. White color.',
        price: 40,
        condition: 'good',
        location: 'Durham, NC',
        images: MARKETPLACE_IMAGES.furniture,
      },
    ];

    const items = [];
    for (let i = 0; i < marketplaceData.length; i++) {
      const itemData = marketplaceData[i];
      const user = users[(i + 10) % users.length];
      
      // Random date within last 20 days
      const daysAgo = Math.floor(Math.random() * 20);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      items.push({
        itemId: `seed-item-${i + 1}`,
        userId: user.userId,
        ...itemData,
        tags: [itemData.category.toLowerCase(), itemData.condition],
        status: 'available',
        views: Math.floor(Math.random() * 40),
        createdAt,
        updatedAt: createdAt,
      });
    }

    await MarketplaceItem.insertMany(items);
    console.log(`✅ Created ${items.length} marketplace items\n`);

    // Summary
    console.log('📊 Seeding Summary:');
    console.log(`   🏠 Rooms: ${rooms.length}`);
    console.log(`   🚗 Rides: ${rides.length}`);
    console.log(`   🛍️  Marketplace: ${items.length}`);
    console.log(`   👥 Posted by: ${users.length} dummy users`);
    console.log('\n✨ Seed posts created successfully!');

  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedPosts();
