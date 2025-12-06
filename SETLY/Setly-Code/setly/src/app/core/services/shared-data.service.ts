import { Injectable, signal, computed } from '@angular/core';
import { RoomStore } from '../state/room.store';
import { inject } from '@angular/core';

/**
 * Shared data service that provides the same data to both Explore and Connect pages.
 * This ensures data consistency across the application - when something is posted in Explore,
 * it automatically appears in Connect.
 */
@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private roomStore = inject(RoomStore);

  // Dummy room listings - shared between Explore and Connect
  // Indian community focused data - students/professionals in USA
  private dummyRooms = signal<any[]>([
    {
      id: 'room1',
      title: 'Private Room with Indian Vegetarian Kitchen',
      location: 'Rutgers University',
      city: 'Edison',
      state: 'NJ',
      university: 'Rutgers University',
      price: '$750/mo',
      priceNum: 750,
      roomType: 'private',
      propertyType: 'Apartment',
      amenities: ['Wi-Fi', 'Laundry', 'Kitchen', 'Parking', 'Indian Roommates', 'Vegetarian-Friendly'],
      verified: true,
      rating: 5,
      host: 'Rajesh Kumar',
      hostId: 'user_rajesh_k',
      authorId: 'Rajesh Kumar',
      condition: 'Excellent',
      seller: 'Student',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'
      ],
      distanceKm: 1.2,
      roomId: 'room1',
      verifiedHost: true,
      likes: 18,
      saved: false
    },
    {
      id: 'room2',
      title: 'Shared Room Near UTD Campus',
      location: 'University of Texas at Dallas',
      city: 'Dallas',
      state: 'TX',
      university: 'UTD',
      price: '$550/mo',
      priceNum: 550,
      roomType: 'shared',
      propertyType: 'Apartment',
      amenities: ['Wi-Fi', 'Kitchen', 'Indian Roommates', 'Vegetarian-Friendly'],
      verified: true,
      rating: 4,
      host: 'Priya Sharma',
      hostId: 'user_priya_s',
      authorId: 'Priya Sharma',
      condition: 'Good',
      seller: 'Student',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      photos: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'
      ],
      distanceKm: 2.1,
      roomId: 'room2',
      verifiedHost: true,
      likes: 14,
      saved: false
    },
    {
      id: 'room3',
      title: 'Studio Near SJSU - Indian Community',
      location: 'San Jose State University',
      city: 'San Jose',
      state: 'CA',
      university: 'SJSU',
      price: '$1450/mo',
      priceNum: 1450,
      roomType: 'private',
      propertyType: 'Studio',
      amenities: ['Wi-Fi', 'Kitchen', 'AC', 'Laundry', 'Parking', 'Vegetarian-Friendly'],
      verified: true,
      rating: 5,
      host: 'Harsh Patel',
      hostId: 'user_harsh_p',
      authorId: 'Harsh Patel',
      condition: 'Excellent',
      seller: 'Professional',
      image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      photos: [
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
      ],
      distanceKm: 0.8,
      roomId: 'room3',
      verifiedHost: true,
      likes: 25,
      saved: true
    },
    {
      id: 'room4',
      title: 'Private Room Near Northeastern - Indian Roommates',
      location: 'Northeastern University',
      city: 'Boston',
      state: 'MA',
      university: 'Northeastern University',
      price: '$950/mo',
      priceNum: 950,
      roomType: 'private',
      propertyType: 'Apartment',
      amenities: ['Wi-Fi', 'Laundry', 'Kitchen', 'Indian Roommates', 'Vegetarian-Friendly'],
      verified: true,
      rating: 5,
      host: 'Nisha Reddy',
      hostId: 'user_nisha_r',
      authorId: 'Nisha Reddy',
      condition: 'Excellent',
      seller: 'Student',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      photos: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'
      ],
      distanceKm: 1.5,
      roomId: 'room4',
      verifiedHost: true,
      likes: 16,
      saved: false
    },
    {
      id: 'room5',
      title: 'Shared Room Near UW - Affordable & Clean',
      location: 'University of Washington',
      city: 'Seattle',
      state: 'WA',
      university: 'UW',
      price: '$700/mo',
      priceNum: 700,
      roomType: 'shared',
      propertyType: 'Apartment',
      amenities: ['Wi-Fi', 'Kitchen', 'Laundry', 'Indian Roommates'],
      verified: false,
      rating: 4,
      host: 'Akash Gupta',
      hostId: 'user_akash_g',
      authorId: 'Akash Gupta',
      condition: 'Good',
      seller: 'Student',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
      ],
      distanceKm: 3.2,
      roomId: 'room5',
      verifiedHost: false,
      likes: 9,
      saved: false
    },
    {
      id: 'room6',
      title: 'Private Room Near Georgia Tech - Indian Kitchen',
      location: 'Georgia Institute of Technology',
      city: 'Atlanta',
      state: 'GA',
      university: 'Georgia Tech',
      price: '$850/mo',
      priceNum: 850,
      roomType: 'private',
      propertyType: 'House',
      amenities: ['Wi-Fi', 'Kitchen', 'Parking', 'Indian Roommates', 'Vegetarian-Friendly'],
      verified: true,
      rating: 5,
      host: 'Megha Jain',
      hostId: 'user_megha_j',
      authorId: 'Megha Jain',
      condition: 'Excellent',
      seller: 'Student',
      image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      photos: [
        'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80'
      ],
      distanceKm: 2.5,
      roomId: 'room6',
      verifiedHost: true,
      likes: 22,
      saved: true
    },
    {
      id: 'room7',
      title: 'Affordable Shared Room Near USC',
      location: 'University of Southern California',
      city: 'Los Angeles',
      state: 'CA',
      university: 'USC',
      price: '$800/mo',
      priceNum: 800,
      roomType: 'shared',
      propertyType: 'Apartment',
      amenities: ['Wi-Fi', 'Laundry', 'Kitchen', 'Indian Roommates'],
      verified: true,
      rating: 4,
      host: 'Arjun Mehta',
      hostId: 'user_arjun_m',
      authorId: 'Arjun Mehta',
      condition: 'Good',
      seller: 'Student',
      image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      photos: [
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80'
      ],
      distanceKm: 4.0,
      roomId: 'room7',
      verifiedHost: true,
      likes: 11,
      saved: false
    },
    {
      id: 'room8',
      title: 'Private Room in Jersey City - Close to NYC',
      location: 'Stevens Institute of Technology',
      city: 'Jersey City',
      state: 'NJ',
      university: 'Stevens',
      price: '$1100/mo',
      priceNum: 1100,
      roomType: 'private',
      propertyType: 'Apartment',
      amenities: ['Wi-Fi', 'AC', 'Kitchen', 'Parking', 'Indian Roommates', 'Vegetarian-Friendly'],
      verified: true,
      rating: 5,
      host: 'Sneha Desai',
      hostId: 'user_sneha_d',
      authorId: 'Sneha Desai',
      condition: 'Excellent',
      seller: 'Professional',
      image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      photos: [
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'
      ],
      distanceKm: 1.8,
      roomId: 'room8',
      verifiedHost: true,
      likes: 20,
      saved: false
    },
    {
      id: 'room9',
      title: 'Shared Room Near UT Austin - Indian Community',
      location: 'University of Texas at Austin',
      city: 'Austin',
      state: 'TX',
      university: 'UT Austin',
      price: '$650/mo',
      priceNum: 650,
      roomType: 'shared',
      propertyType: 'Apartment',
      amenities: ['Wi-Fi', 'Kitchen', 'Laundry', 'Indian Roommates', 'Vegetarian-Friendly'],
      verified: true,
      rating: 4,
      host: 'Rohan Khanna',
      hostId: 'user_rohan_k',
      authorId: 'Rohan Khanna',
      condition: 'Good',
      seller: 'Student',
      image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      photos: [
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80'
      ],
      distanceKm: 2.8,
      roomId: 'room9',
      verifiedHost: true,
      likes: 13,
      saved: false
    },
    {
      id: 'room10',
      title: 'Private Room Near UIUC - Vegetarian Kitchen',
      location: 'University of Illinois Urbana-Champaign',
      city: 'Champaign',
      state: 'IL',
      university: 'UIUC',
      price: '$700/mo',
      priceNum: 700,
      roomType: 'private',
      propertyType: 'House',
      amenities: ['Wi-Fi', 'Kitchen', 'Parking', 'Indian Roommates', 'Vegetarian-Friendly'],
      verified: true,
      rating: 5,
      host: 'Kavya Iyer',
      hostId: 'user_kavya_i',
      authorId: 'Kavya Iyer',
      condition: 'Excellent',
      seller: 'Student',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      photos: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'
      ],
      distanceKm: 1.0,
      roomId: 'room10',
      verifiedHost: true,
      likes: 17,
      saved: true
    }
  ]);

  // Combined rooms from dummy data and RoomStore
  rooms = computed(() => {
    const storeRooms = this.roomStore.filteredRooms().map((r: any) => ({
      id: r.id,
      title: r.title,
      location: r.city || r.universityName || r.address,
      city: r.city,
      university: r.universityName,
      price: `$${r.price}/mo`,
      priceNum: r.price,
      roomType: r.type || r.roomType || 'private',
      propertyType: r.propertyType || 'Apartment',
      amenities: r.amenities || [],
      verified: r.verified || false,
      rating: r.rating || 4,
      image: r.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      host: r.hostName || 'Host',
      hostId: r.hostId || 'unknown',
      authorId: r.hostName || 'Host',
      condition: 'Good',
      seller: 'Landlord',
      createdAt: r.createdAt || new Date(),
      photos: r.photos || [r.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
      distanceKm: r.distance || 0,
      roomId: r.id,
      verifiedHost: r.verified || false,
      likes: r.likes || 0,
      saved: r.saved || false
    }));
    return [...this.dummyRooms(), ...storeRooms];
  });

  // Dummy ride listings - shared between Explore and Connect
  // Indian community travel patterns in USA
  rides = signal<any[]>([
    {
      id: 'ride1',
      type: 'ride',
      title: 'Jersey City → Edison (Indian Stores)',
      from: 'Jersey City',
      fromLine1: 'Jersey City, NJ',
      fromLine2: 'Journal Square',
      to: 'Edison',
      toLine1: 'Edison, NJ',
      toLine2: 'Oak Tree Road (Indian Shopping)',
      departureDate: 'Saturday, Dec 7',
      departureTime: '10:00 AM',
      when: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      timeLeftPercent: 75,
      distance: '28 miles',
      duration: '45 min',
      price: '$12',
      priceNum: 12,
      seatsAvailable: 2,
      seats: 2,
      totalSeats: 3,
      rating: 5,
      tripsCompleted: 85,
      weather: { city: 'Edison', temp: '48°', condition: 'Partly Cloudy' },
      driver: { 
        name: 'Vikram Singh', 
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        trustScore: 98, 
        verified: true,
        studentVerified: true
      },
      authorId: 'Vikram Singh',
      hostId: 'user_vikram_s',
      car: {
        make: 'Honda Accord',
        color: 'Black',
        year: 2020,
        image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&q=80'
      },
      passengers: [ { name: 'Priya', initial: 'P' } ],
      aiSummary: 'Weekend grocery run to Indian stores on Oak Tree Road.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      driverVerified: true,
      isSetlyRide: true,
      mutualsJoined: ['Priya S.'],
      likes: 15,
      saved: false
    },
    {
      id: 'ride2',
      type: 'ride',
      title: 'Boston → New York (Weekend)',
      from: 'Boston',
      fromLine1: 'Boston, MA',
      fromLine2: 'South Station',
      to: 'New York',
      toLine1: 'New York, NY',
      toLine2: 'Manhattan - Penn Station',
      departureDate: 'Friday, Dec 6',
      departureTime: '6:00 PM',
      when: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      timeLeftPercent: 60,
      distance: '215 miles',
      duration: '4h 15min',
      price: '$40',
      priceNum: 40,
      seatsAvailable: 3,
      seats: 3,
      totalSeats: 3,
      rating: 5,
      tripsCompleted: 120,
      weather: { city: 'New York', temp: '45°', condition: 'Cloudy' },
      driver: { 
        name: 'Ananya Krishnan', 
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
        trustScore: 95, 
        verified: true,
        studentVerified: true
      },
      authorId: 'Ananya Krishnan',
      hostId: 'user_ananya_k',
      car: {
        make: 'Toyota Camry',
        color: 'Silver',
        year: 2021,
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80'
      },
      passengers: [],
      aiSummary: 'Weekend trip to NYC with verified student driver.',
      image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      driverVerified: true,
      isSetlyRide: true,
      mutualsJoined: [],
      likes: 22,
      saved: true
    },
    {
      id: 'ride3',
      type: 'ride',
      title: 'Dallas → Austin',
      from: 'Dallas',
      fromLine1: 'Dallas, TX',
      fromLine2: 'Richardson (Near UTD)',
      to: 'Austin',
      toLine1: 'Austin, TX',
      toLine2: 'Downtown',
      departureDate: 'Sunday, Dec 8',
      departureTime: '1:00 PM',
      when: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      timeLeftPercent: 80,
      distance: '195 miles',
      duration: '3h 20min',
      price: '$35',
      priceNum: 35,
      seatsAvailable: 2,
      seats: 2,
      totalSeats: 4,
      rating: 5,
      tripsCompleted: 65,
      weather: { city: 'Austin', temp: '68°', condition: 'Sunny' },
      driver: { 
        name: 'Aditya Malhotra', 
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        trustScore: 92, 
        verified: true,
        studentVerified: true
      },
      authorId: 'Aditya Malhotra',
      hostId: 'user_aditya_m',
      car: {
        make: 'Honda Civic',
        color: 'Blue',
        year: 2019,
        image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&q=80'
      },
      passengers: [ { name: 'Rahul', initial: 'R' }, { name: 'Neha', initial: 'N' } ],
      aiSummary: 'Sunday afternoon trip to Austin with friends.',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      driverVerified: true,
      isSetlyRide: true,
      mutualsJoined: ['Rahul M.', 'Neha S.'],
      likes: 18,
      saved: false
    },
    {
      id: 'ride4',
      type: 'ride',
      title: 'San Jose → Fremont (Grocery Run)',
      from: 'San Jose',
      fromLine1: 'San Jose, CA',
      fromLine2: 'SJSU Campus',
      to: 'Fremont',
      toLine1: 'Fremont, CA',
      toLine2: 'Little India - Indian Stores',
      departureDate: 'Saturday, Dec 7',
      departureTime: '2:00 PM',
      when: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      timeLeftPercent: 65,
      distance: '18 miles',
      duration: '30 min',
      price: '$10',
      priceNum: 10,
      seatsAvailable: 3,
      seats: 3,
      totalSeats: 4,
      rating: 5,
      tripsCompleted: 50,
      weather: { city: 'Fremont', temp: '58°', condition: 'Sunny' },
      driver: { 
        name: 'Divya Nair', 
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
        trustScore: 94, 
        verified: true,
        studentVerified: true
      },
      authorId: 'Divya Nair',
      hostId: 'user_divya_n',
      car: {
        make: 'Toyota Corolla',
        color: 'White',
        year: 2020,
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80'
      },
      passengers: [ { name: 'Amit', initial: 'A' } ],
      aiSummary: 'Quick trip to Indian grocery stores in Fremont.',
      image: 'https://images.unsplash.com/photo-1502489597346-dad15683d4c2?w=800&q=80',
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
      driverVerified: true,
      isSetlyRide: true,
      mutualsJoined: ['Amit P.'],
      likes: 12,
      saved: false
    },
    {
      id: 'ride5',
      type: 'ride',
      title: 'Chicago → Naperville (Weekend)',
      from: 'Chicago',
      fromLine1: 'Chicago, IL',
      fromLine2: 'Downtown Loop',
      to: 'Naperville',
      toLine1: 'Naperville, IL',
      toLine2: 'Indian Community Area',
      departureDate: 'Saturday, Dec 7',
      departureTime: '11:00 AM',
      when: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      timeLeftPercent: 55,
      distance: '28 miles',
      duration: '45 min',
      price: '$15',
      priceNum: 15,
      seatsAvailable: 1,
      seats: 1,
      totalSeats: 3,
      rating: 4,
      tripsCompleted: 75,
      weather: { city: 'Naperville', temp: '42°', condition: 'Clear' },
      driver: { 
        name: 'Karthik Reddy', 
        avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80',
        trustScore: 88, 
        verified: true,
        studentVerified: true
      },
      authorId: 'Karthik Reddy',
      hostId: 'user_karthik_r',
      car: {
        make: 'Honda CR-V',
        color: 'Gray',
        year: 2018,
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&q=80'
      },
      passengers: [ { name: 'Sanjay', initial: 'S' }, { name: 'Maya', initial: 'M' } ],
      aiSummary: 'Morning ride to Naperville Indian community.',
      image: 'https://images.unsplash.com/photo-1502224562085-639556652f33?w=800&q=80',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      driverVerified: true,
      isSetlyRide: true,
      mutualsJoined: ['Sanjay K.', 'Maya J.'],
      likes: 14,
      saved: false
    },
    {
      id: 'ride6',
      type: 'ride',
      title: 'Atlanta → Alpharetta (Office Commute)',
      from: 'Atlanta',
      fromLine1: 'Atlanta, GA',
      fromLine2: 'Midtown',
      to: 'Alpharetta',
      toLine1: 'Alpharetta, GA',
      toLine2: 'Tech Park',
      departureDate: 'Monday, Dec 9',
      departureTime: '8:00 AM',
      when: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      timeLeftPercent: 85,
      distance: '26 miles',
      duration: '35 min',
      price: '$12',
      priceNum: 12,
      seatsAvailable: 2,
      seats: 2,
      totalSeats: 4,
      rating: 5,
      tripsCompleted: 200,
      weather: { city: 'Alpharetta', temp: '55°', condition: 'Clear' },
      driver: { 
        name: 'Ravi Kumar', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        trustScore: 96, 
        verified: true,
        studentVerified: false
      },
      authorId: 'Ravi Kumar',
      hostId: 'user_ravi_k',
      car: {
        make: 'Toyota Prius',
        color: 'Silver',
        year: 2022,
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80'
      },
      passengers: [ { name: 'Pooja', initial: 'P' }, { name: 'Arjun', initial: 'A' } ],
      aiSummary: 'Daily office commute with tech professionals.',
      image: 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&q=80',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      driverVerified: true,
      isSetlyRide: true,
      mutualsJoined: ['Pooja M.', 'Arjun D.'],
      likes: 25,
      saved: true
    },
    {
      id: 'ride7',
      type: 'ride',
      title: 'Seattle → Bellevue (Daily Commute)',
      from: 'Seattle',
      fromLine1: 'Seattle, WA',
      fromLine2: 'University District',
      to: 'Bellevue',
      toLine1: 'Bellevue, WA',
      toLine2: 'Downtown',
      departureDate: 'Tuesday, Dec 10',
      departureTime: '7:30 AM',
      when: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      timeLeftPercent: 70,
      distance: '12 miles',
      duration: '25 min',
      price: '$8',
      priceNum: 8,
      seatsAvailable: 1,
      seats: 1,
      totalSeats: 3,
      rating: 5,
      tripsCompleted: 150,
      weather: { city: 'Bellevue', temp: '50°', condition: 'Rainy' },
      driver: { 
        name: 'Sanjana Menon', 
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
        trustScore: 97, 
        verified: true,
        studentVerified: true
      },
      authorId: 'Sanjana Menon',
      hostId: 'user_sanjana_m',
      car: {
        make: 'Mazda CX-5',
        color: 'Red',
        year: 2021,
        image: 'https://images.unsplash.com/photo-1570733577470-76a4d7eb2343?w=400&q=80'
      },
      passengers: [ { name: 'Rahul', initial: 'R' }, { name: 'Deepa', initial: 'D' } ],
      aiSummary: 'Morning commute to Bellevue tech hub.',
      image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80',
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      driverVerified: true,
      isSetlyRide: true,
      mutualsJoined: ['Rahul S.', 'Deepa K.'],
      likes: 19,
      saved: false
    },
    {
      id: 'ride8',
      type: 'ride',
      title: 'Los Angeles → Artesia (Little India)',
      from: 'Los Angeles',
      fromLine1: 'Los Angeles, CA',
      fromLine2: 'Downtown',
      to: 'Artesia',
      toLine1: 'Artesia, CA',
      toLine2: 'Pioneer Blvd (Indian Stores)',
      departureDate: 'Saturday, Dec 7',
      departureTime: '3:00 PM',
      when: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      timeLeftPercent: 50,
      distance: '22 miles',
      duration: '40 min',
      price: '$12',
      priceNum: 12,
      seatsAvailable: 2,
      seats: 2,
      totalSeats: 4,
      rating: 4,
      tripsCompleted: 40,
      weather: { city: 'Artesia', temp: '68°', condition: 'Sunny' },
      driver: { 
        name: 'Nikhil Kapoor', 
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        trustScore: 89, 
        verified: true,
        studentVerified: true
      },
      authorId: 'Nikhil Kapoor',
      hostId: 'user_nikhil_k',
      car: {
        make: 'Nissan Altima',
        color: 'Black',
        year: 2019,
        image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&q=80'
      },
      passengers: [ { name: 'Priya', initial: 'P' }, { name: 'Varun', initial: 'V' } ],
      aiSummary: 'Weekend trip to Little India for shopping.',
      image: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&q=80',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      driverVerified: true,
      isSetlyRide: true,
      mutualsJoined: ['Priya R.', 'Varun A.'],
      likes: 16,
      saved: false
    }
  ]);

  // Dummy marketplace listings - shared between Explore and Connect
  // Indian community items commonly traded by students/professionals in USA
  marketplace = signal<any[]>([
    { 
      id: 'market1',
      type: 'market',
      title: 'Pre-Owned Mattress - Queen Size', 
      category: 'Furniture', 
      location: 'Rutgers University', 
      place: 'Edison',
      state: 'NJ',
      price: '$80', 
      priceNum: 80, 
      condition: 'Good', 
      seller: 'Student',
      sellerName: 'Amit Sharma',
      authorId: 'Amit Sharma',
      hostId: 'user_amit_s',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', 
      badge: 'Furniture',
      description: 'Clean queen size mattress, used for 1 year. Moving out sale.',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      likes: 8,
      saved: false
    },
    { 
      id: 'market2',
      type: 'market',
      title: 'Study Table with Chair', 
      category: 'Furniture', 
      location: 'UTD', 
      place: 'Dallas',
      state: 'TX',
      price: '$60', 
      priceNum: 60, 
      condition: 'Like new', 
      seller: 'Student',
      sellerName: 'Priya Menon',
      authorId: 'Priya Menon',
      hostId: 'user_priya_m',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80', 
      badge: 'Furniture',
      description: 'Sturdy study table with ergonomic chair. Perfect for students.',
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
      likes: 12,
      saved: true
    },
    { 
      id: 'market3',
      type: 'market',
      title: 'Office Chair - Ergonomic', 
      category: 'Furniture', 
      location: 'SJSU', 
      place: 'San Jose',
      state: 'CA',
      price: '$70', 
      priceNum: 70, 
      condition: 'Good', 
      seller: 'Professional',
      sellerName: 'Rohan Patel',
      authorId: 'Rohan Patel',
      hostId: 'user_rohan_p',
      image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80', 
      badge: 'Furniture',
      description: 'Comfortable office chair with lumbar support. WFH essential.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      likes: 15,
      saved: false
    },
    { 
      id: 'market4',
      type: 'market',
      title: 'Prestige Pressure Cooker - 5L', 
      category: 'Kitchen', 
      location: 'Northeastern University', 
      place: 'Boston',
      state: 'MA',
      price: '$45', 
      priceNum: 45, 
      condition: 'Like new', 
      seller: 'Student',
      sellerName: 'Neha Reddy',
      authorId: 'Neha Reddy',
      hostId: 'user_neha_r',
      image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80', 
      badge: 'Kitchen',
      description: 'Indian pressure cooker, 5 liters. Perfect for cooking rice and dal.',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      likes: 18,
      saved: true
    },
    { 
      id: 'market5',
      type: 'market',
      title: 'Rice Cooker - Zojirushi', 
      category: 'Kitchen', 
      location: 'UW', 
      place: 'Seattle',
      state: 'WA',
      price: '$55', 
      priceNum: 55, 
      condition: 'Good', 
      seller: 'Student',
      sellerName: 'Karan Gupta',
      authorId: 'Karan Gupta',
      hostId: 'user_karan_g',
      image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80', 
      badge: 'Kitchen',
      description: 'Automatic rice cooker, makes perfect basmati rice every time.',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      likes: 10,
      saved: false
    },
    { 
      id: 'market6',
      type: 'market',
      title: 'Dosa Tawa & Indian Cookware Set', 
      category: 'Kitchen', 
      location: 'Georgia Tech', 
      place: 'Atlanta',
      state: 'GA',
      price: '$35', 
      priceNum: 35, 
      condition: 'Good', 
      seller: 'Student',
      sellerName: 'Divya Iyer',
      authorId: 'Divya Iyer',
      hostId: 'user_divya_i',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80', 
      badge: 'Kitchen',
      description: 'Cast iron dosa tawa with kadai and other Indian cooking utensils.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      likes: 14,
      saved: false
    },
    { 
      id: 'market7',
      type: 'market',
      title: 'Office Desk - L-Shaped', 
      category: 'Furniture', 
      location: 'USC', 
      place: 'Los Angeles',
      state: 'CA',
      price: '$100', 
      priceNum: 100, 
      condition: 'Like new', 
      seller: 'Professional',
      sellerName: 'Arjun Mehta',
      authorId: 'Arjun Mehta',
      hostId: 'user_arjun_m',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80', 
      badge: 'Furniture',
      description: 'Large L-shaped desk, perfect for dual monitor setup. WFH ready.',
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      likes: 20,
      saved: true
    },
    { 
      id: 'market8',
      type: 'market',
      title: 'Mini Fridge - Compact', 
      category: 'Appliances', 
      location: 'Stevens Institute', 
      place: 'Jersey City',
      state: 'NJ',
      price: '$75', 
      priceNum: 75, 
      condition: 'Good', 
      seller: 'Student',
      sellerName: 'Sanjana Desai',
      authorId: 'Sanjana Desai',
      hostId: 'user_sanjana_d',
      image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80', 
      badge: 'Appliances',
      description: 'Compact mini fridge, perfect for dorm or apartment. Energy efficient.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      likes: 11,
      saved: false
    },
    { 
      id: 'market9',
      type: 'market',
      title: 'iPhone 13 - 128GB Unlocked', 
      category: 'Electronics', 
      location: 'UT Austin', 
      place: 'Austin',
      state: 'TX',
      price: '$450', 
      priceNum: 450, 
      condition: 'Like new', 
      seller: 'Student',
      sellerName: 'Rahul Khanna',
      authorId: 'Rahul Khanna',
      hostId: 'user_rahul_k',
      image: 'https://images.unsplash.com/photo-1592286927505-f0e2fe45f78b?w=800&q=80', 
      badge: 'Electronics',
      description: 'iPhone 13, 128GB, unlocked. Excellent condition with case and charger.',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      likes: 25,
      saved: true
    },
    { 
      id: 'market10',
      type: 'market',
      title: 'MacBook Air M1 - 2020', 
      category: 'Electronics', 
      location: 'UIUC', 
      place: 'Champaign',
      state: 'IL',
      price: '$700', 
      priceNum: 700, 
      condition: 'Good', 
      seller: 'Student',
      sellerName: 'Kavya Nair',
      authorId: 'Kavya Nair',
      hostId: 'user_kavya_n',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 
      badge: 'Electronics',
      description: 'MacBook Air M1, 8GB RAM, 256GB SSD. Perfect for students. Works great.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      likes: 22,
      saved: false
    }
  ]);

  // Get all data combined for Connect feed
  getAllPosts() {
    const roomPosts = this.rooms().map(r => ({ ...r, type: 'room' }));
    const ridePosts = this.rides();
    const marketPosts = this.marketplace();
    
    // Combine and sort by createdAt (newest first)
    return [...roomPosts, ...ridePosts, ...marketPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get filtered posts by type
  getPostsByType(type: string) {
    if (type === 'room' || type === 'rooms') return this.rooms().map(r => ({ ...r, type: 'room' }));
    if (type === 'ride' || type === 'rides') return this.rides();
    if (type === 'market' || type === 'marketplace') return this.marketplace();
    return this.getAllPosts();
  }
}
