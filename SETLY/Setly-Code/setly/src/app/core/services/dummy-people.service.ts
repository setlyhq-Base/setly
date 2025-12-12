import { Injectable } from '@angular/core';
import { DirectoryUser } from './people-directory.service';
import { environment } from '../../../environments/environment';

export interface DummyUser extends DirectoryUser {
  tagline?: string;
  about?: string;
  interests: string[];
  mutualInterests?: string[];
  languages?: string[];
  hasRoom?: boolean;
  offersRides?: boolean;
  isTrader?: boolean;
  isGuide?: boolean;
  isSenior?: boolean;
  lat?: number;
  lng?: number;
}

@Injectable({ providedIn: 'root' })
export class DummyPeopleService {
  private readonly STORAGE_KEY = 'setly_dummy_users_v1';
  private dummyUsers: DummyUser[] = [
    {
      id: 'user-1',
      name: 'Priya Sharma',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      universityId: 'northeastern',
      organization: 'Northeastern University',
      role: 'Student',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      location: 'Boston, MA',
      lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago (online)
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'MSCS @ Northeastern | Coffee enthusiast + Hackathon lover',
      about: 'Graduate student passionate about AI/ML. Love exploring Boston coffee shops and attending tech meetups.',
      interests: ['Coffee', 'Hackathons', 'AI/ML', 'Photography', 'Hiking', 'Indian Food'],
      mutualInterests: ['Coffee', 'Hackathons', 'Photography'],
      languages: ['English', 'Hindi'],
      hasRoom: true,
      isGuide: true,
      lat: 42.3398,
      lng: -71.0892
    },
    {
      id: 'user-2',
      name: 'Rahul Patel',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      universityId: 'mit',
      organization: 'MIT',
      role: 'Student',
      city: 'Cambridge',
      state: 'MA',
      country: 'USA',
      location: 'Cambridge, MA',
      lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago (online)
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'MIT CS | Startup enthusiast | Cricket fan',
      about: 'Computer Science major at MIT. Building a startup on the side. Always up for cricket on weekends!',
      interests: ['Startups', 'Cricket', 'Coding', 'Biking', 'Gaming', 'Street Food'],
      mutualInterests: ['Coding', 'Gaming'],
      languages: ['English', 'Gujarati'],
      offersRides: true,
      isSenior: true,
      lat: 42.3601,
      lng: -71.0942
    },
    {
      id: 'user-3',
      name: 'Ananya Reddy',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      universityId: 'harvard',
      organization: 'Harvard University',
      role: 'Student',
      city: 'Cambridge',
      state: 'MA',
      country: 'USA',
      location: 'Cambridge, MA',
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Harvard MBA | Ex-consultant | Yoga & travel',
      about: 'MBA student at Harvard Business School. Love exploring New England and practicing yoga.',
      interests: ['Yoga', 'Travel', 'Consulting', 'Cooking', 'Reading', 'Wine Tasting'],
      mutualInterests: ['Travel', 'Cooking'],
      languages: ['English', 'Telugu'],
      hasRoom: false,
      isGuide: true,
      lat: 42.3770,
      lng: -71.1167
    },
    {
      id: 'user-4',
      name: 'Arjun Mehta',
      avatarUrl: 'https://i.pravatar.cc/150?img=13',
      universityId: 'bu',
      organization: 'Boston University',
      role: 'Working Professional',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      location: 'Boston, MA',
      lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      badges: { email: true, phone: true, university: false, photo: true },
      tagline: 'Software Engineer @ Amazon | BU Alum',
      about: 'Working at Amazon as SDE-2. Alumni of Boston University. Love mentoring students.',
      interests: ['Tech', 'Mentoring', 'Running', 'Concerts', 'Food Tours'],
      mutualInterests: ['Tech', 'Running'],
      offersRides: true,
      isTrader: true,
      lat: 42.3505,
      lng: -71.1054
    },
    {
      id: 'user-5',
      name: 'Kavya Krishnan',
      avatarUrl: 'https://i.pravatar.cc/150?img=9',
      universityId: 'northeastern',
      organization: 'Northeastern University',
      role: 'Student',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      location: 'Boston, MA',
      lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'CS @ NEU | UI/UX Designer | Art lover',
      about: 'Computer Science student specializing in HCI. Love creating beautiful interfaces.',
      interests: ['UI/UX', 'Design', 'Art', 'Museums', 'Photography', 'Coffee', 'Sketching'],
      mutualInterests: ['Photography', 'Coffee', 'Art'],
      hasRoom: true,
      lat: 42.3398,
      lng: -71.0892
    },
    {
      id: 'user-6',
      name: 'Rohan Gupta',
      avatarUrl: 'https://i.pravatar.cc/150?img=14',
      universityId: 'nyu',
      organization: 'NYU',
      role: 'Student',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      location: 'New York, NY',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      badges: { email: true, phone: true, university: true, photo: false },
      tagline: 'NYU Stern | Finance major | Bollywood fan',
      about: 'Finance student at NYU Stern. Always exploring NYC food scene.',
      interests: ['Finance', 'Bollywood', 'Food', 'Basketball', 'Networking'],
      mutualInterests: ['Food', 'Basketball'],
      hasRoom: false,
      lat: 40.7295,
      lng: -73.9965
    },
    {
      id: 'user-7',
      name: 'Sneha Iyer',
      avatarUrl: 'https://i.pravatar.cc/150?img=10',
      universityId: 'columbia',
      organization: 'Columbia University',
      role: 'Student',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      location: 'New York, NY',
      lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago (online)
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Columbia CS | ML researcher | Dance enthusiast',
      about: 'PhD student researching machine learning. Classical Indian dance performer.',
      interests: ['Machine Learning', 'Research', 'Dance', 'Classical Music', 'Teaching'],
      mutualInterests: ['Machine Learning', 'Teaching'],
      isGuide: true,
      isSenior: true,
      lat: 40.8075,
      lng: -73.9626
    },
    {
      id: 'user-8',
      name: 'Vikram Singh',
      avatarUrl: 'https://i.pravatar.cc/150?img=15',
      universityId: 'stanford',
      organization: 'Stanford University',
      role: 'Alumni',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      location: 'San Francisco, CA',
      lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Stanford Alum | Product Manager @ Google',
      about: 'PM at Google working on Search. Stanford CS grad. Love hiking and photography.',
      interests: ['Product Management', 'Hiking', 'Photography', 'Travel', 'Wine'],
      mutualInterests: ['Hiking', 'Photography', 'Travel'],
      offersRides: false,
      isTrader: true,
      lat: 37.7749,
      lng: -122.4194
    },
    {
      id: 'user-9',
      name: 'Meera Nair',
      avatarUrl: 'https://i.pravatar.cc/150?img=16',
      universityId: 'berkeley',
      organization: 'UC Berkeley',
      role: 'Student',
      city: 'Berkeley',
      state: 'CA',
      country: 'USA',
      location: 'Berkeley, CA',
      lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
      badges: { email: true, phone: false, university: true, photo: true },
      tagline: 'Berkeley EECS | Open source contributor',
      about: 'Electrical Engineering & CS major. Active open source contributor. Love the Bay Area weather!',
      interests: ['Open Source', 'Coding', 'Tech Events', 'Beach', 'Meditation'],
      mutualInterests: ['Coding', 'Tech Events'],
      hasRoom: true,
      lat: 37.8715,
      lng: -122.2730
    },
    {
      id: 'user-10',
      name: 'Aditya Kapoor',
      avatarUrl: 'https://i.pravatar.cc/150?img=17',
      universityId: 'usc',
      organization: 'USC',
      role: 'Student',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      location: 'Los Angeles, CA',
      lastSeen: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 min ago (online)
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'USC Film School | Aspiring director',
      about: 'Film production student at USC. Making short films and documentaries.',
      interests: ['Film Making', 'Photography', 'Music', 'LA Culture', 'Surfing'],
      mutualInterests: ['Photography', 'Music'],
      offersRides: true,
      lat: 34.0224,
      lng: -118.2851
    },
    {
      id: 'user-11',
      name: 'Divya Menon',
      avatarUrl: 'https://i.pravatar.cc/150?img=20',
      universityId: 'uw',
      organization: 'University of Washington',
      role: 'Student',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      location: 'Seattle, WA',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'UW CSE | Cloud computing enthusiast',
      about: 'Computer Science student focusing on cloud architecture. Coffee addict!',
      interests: ['Cloud Computing', 'Coffee', 'Hiking', 'Gaming', 'Concerts'],
      mutualInterests: ['Coffee', 'Hiking', 'Gaming'],
      hasRoom: true,
      isGuide: true,
      lat: 47.6062,
      lng: -122.3321
    },
    {
      id: 'user-12',
      name: 'Karthik Bose',
      avatarUrl: 'https://i.pravatar.cc/150?img=18',
      universityId: 'cmu',
      organization: 'Carnegie Mellon',
      role: 'Student',
      city: 'Pittsburgh',
      state: 'PA',
      country: 'USA',
      location: 'Pittsburgh, PA',
      lastSeen: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'CMU Robotics | Self-driving cars',
      about: 'Robotics Institute student working on autonomous vehicles. Soccer player.',
      interests: ['Robotics', 'AI', 'Soccer', 'Gaming', 'Biking'],
      mutualInterests: ['AI', 'Gaming', 'Soccer'],
      isSenior: true,
      lat: 40.4443,
      lng: -79.9436
    },
    {
      id: 'user-13',
      name: 'Ishita Joshi',
      avatarUrl: 'https://i.pravatar.cc/150?img=21',
      universityId: 'gatech',
      organization: 'Georgia Tech',
      role: 'Student',
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      location: 'Atlanta, GA',
      lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Georgia Tech CS | Cybersecurity focus',
      about: 'Specializing in cybersecurity and ethical hacking. Love Atlanta food scene.',
      interests: ['Cybersecurity', 'Hacking', 'Food', 'Music Festivals', 'Travel'],
      mutualInterests: ['Food', 'Travel'],
      hasRoom: false,
      lat: 33.7756,
      lng: -84.3963
    },
    {
      id: 'user-14',
      name: 'Siddharth Rao',
      avatarUrl: 'https://i.pravatar.cc/150?img=19',
      universityId: 'utaustin',
      organization: 'UT Austin',
      role: 'Working Professional',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      location: 'Austin, TX',
      lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Data Scientist @ Tesla | UT Austin Alum',
      about: 'Working on autonomous driving ML models. Love Austin live music scene.',
      interests: ['Data Science', 'Live Music', 'BBQ', 'Startups', 'Running'],
      mutualInterests: ['Data Science', 'Running', 'Startups'],
      offersRides: true,
      isTrader: true,
      lat: 30.2672,
      lng: -97.7431
    },
    {
      id: 'user-15',
      name: 'Nidhi Verma',
      avatarUrl: 'https://i.pravatar.cc/150?img=22',
      universityId: 'uchicago',
      organization: 'University of Chicago',
      role: 'Student',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      location: 'Chicago, IL',
      lastSeen: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 min ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'UChicago Econ | Policy research',
      about: 'Economics PhD student researching public policy. Love Chicago deep dish!',
      interests: ['Economics', 'Research', 'Policy', 'Museums', 'Theater'],
      mutualInterests: ['Research', 'Museums', 'Theater'],
      isGuide: true,
      lat: 41.7886,
      lng: -87.5987
    },
    {
      id: 'user-16',
      name: 'Aarav Desai',
      avatarUrl: 'https://i.pravatar.cc/150?img=23',
      universityId: 'upenn',
      organization: 'University of Pennsylvania',
      role: 'Student',
      city: 'Philadelphia',
      state: 'PA',
      country: 'USA',
      location: 'Philadelphia, PA',
      lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago (online)
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Penn Wharton | Fintech entrepreneur',
      about: 'Finance & CS dual degree. Building a fintech startup. Love Philly cheesesteaks!',
      interests: ['Fintech', 'Entrepreneurship', 'Basketball', 'Reading', 'Investing'],
      mutualInterests: ['Entrepreneurship', 'Basketball', 'Reading'],
      hasRoom: true,
      offersRides: false,
      lat: 39.9522,
      lng: -75.1932
    },
    {
      id: 'user-17',
      name: 'Pooja Srinivasan',
      avatarUrl: 'https://i.pravatar.cc/150?img=24',
      universityId: 'duke',
      organization: 'Duke University',
      role: 'Student',
      city: 'Durham',
      state: 'NC',
      country: 'USA',
      location: 'Durham, NC',
      lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Duke Biomedical Engineering | Healthcare tech',
      about: 'BME student working on medical devices. Passionate about healthcare innovation.',
      interests: ['Healthcare', 'Engineering', 'Tennis', 'Yoga', 'Volunteering'],
      mutualInterests: ['Healthcare', 'Tennis', 'Yoga'],
      isGuide: true,
      isSenior: true,
      lat: 35.9940,
      lng: -78.8986
    },
    {
      id: 'user-18',
      name: 'Arnav Chatterjee',
      avatarUrl: 'https://i.pravatar.cc/150?img=25',
      universityId: 'northwestern',
      organization: 'Northwestern University',
      role: 'Student',
      city: 'Evanston',
      state: 'IL',
      country: 'USA',
      location: 'Evanston, IL',
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      badges: { email: true, phone: false, university: true, photo: true },
      tagline: 'Northwestern Journalism | Documentary maker',
      about: 'Journalism student creating documentaries about immigrant stories.',
      interests: ['Journalism', 'Documentary', 'Writing', 'Photography', 'Social Impact'],
      mutualInterests: ['Photography', 'Writing', 'Social Impact'],
      lat: 42.0565,
      lng: -87.6753
    },
    {
      id: 'user-19',
      name: 'Riya Malhotra',
      avatarUrl: 'https://i.pravatar.cc/150?img=26',
      universityId: 'cornell',
      organization: 'Cornell University',
      role: 'Student',
      city: 'Ithaca',
      state: 'NY',
      country: 'USA',
      location: 'Ithaca, NY',
      lastSeen: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 min ago (online)
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Cornell Hotel School | Hospitality + Travel',
      about: 'Studying hospitality management. Love traveling and trying new cuisines.',
      interests: ['Hospitality', 'Travel', 'Food', 'Event Planning', 'Wine'],
      mutualInterests: ['Travel', 'Food', 'Wine'],
      hasRoom: true,
      lat: 42.4534,
      lng: -76.4735
    },
    {
      id: 'user-20',
      name: 'Harsh Agarwal',
      avatarUrl: 'https://i.pravatar.cc/150?img=27',
      universityId: 'umich',
      organization: 'University of Michigan',
      role: 'Student',
      city: 'Ann Arbor',
      state: 'MI',
      country: 'USA',
      location: 'Ann Arbor, MI',
      lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'UMich Engineering | Automotive enthusiast',
      about: 'Mechanical Engineering student passionate about electric vehicles.',
      interests: ['Automotive', 'Engineering', 'Football', 'Camping', 'DIY Projects'],
      mutualInterests: ['Engineering', 'Football', 'Camping'],
      offersRides: true,
      lat: 42.2808,
      lng: -83.7430
    },
    {
      id: 'user-21',
      name: 'Tanvi Shah',
      avatarUrl: 'https://i.pravatar.cc/150?img=28',
      universityId: 'uiuc',
      organization: 'UIUC',
      role: 'Student',
      city: 'Urbana',
      state: 'IL',
      country: 'USA',
      location: 'Urbana, IL',
      lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago (online)
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'UIUC CS | Blockchain developer',
      about: 'Computer Science student building dApps. Crypto enthusiast.',
      interests: ['Blockchain', 'Crypto', 'Web3', 'Gaming', 'Tech News'],
      mutualInterests: ['Blockchain', 'Gaming', 'Tech News'],
      isTrader: true,
      lat: 40.1106,
      lng: -88.2073
    },
    {
      id: 'user-22',
      name: 'Varun Khanna',
      avatarUrl: 'https://i.pravatar.cc/150?img=29',
      universityId: 'ucsandiego',
      organization: 'UC San Diego',
      role: 'Student',
      city: 'San Diego',
      state: 'CA',
      country: 'USA',
      location: 'San Diego, CA',
      lastSeen: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 min ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'UCSD Biotech | Surfing enthusiast',
      about: 'Biotechnology student. Love the San Diego beaches and surf culture.',
      interests: ['Biotechnology', 'Surfing', 'Beach', 'Marine Biology', 'Photography'],
      mutualInterests: ['Surfing', 'Beach', 'Photography'],
      hasRoom: false,
      lat: 32.8801,
      lng: -117.2340
    },
    {
      id: 'user-23',
      name: 'Lakshmi Iyer',
      avatarUrl: 'https://i.pravatar.cc/150?img=30',
      universityId: 'rice',
      organization: 'Rice University',
      role: 'Student',
      city: 'Houston',
      state: 'TX',
      country: 'USA',
      location: 'Houston, TX',
      lastSeen: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 min ago (online)
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Rice Architecture | Sustainable design',
      about: 'Architecture student focusing on sustainable urban planning.',
      interests: ['Architecture', 'Sustainability', 'Art', 'Urban Planning', 'Travel'],
      mutualInterests: ['Architecture', 'Art', 'Travel'],
      isGuide: true,
      lat: 29.7174,
      lng: -95.4018
    },
    {
      id: 'user-24',
      name: 'Dev Malhotra',
      avatarUrl: 'https://i.pravatar.cc/150?img=31',
      universityId: 'vanderbilt',
      organization: 'Vanderbilt University',
      role: 'Alumni',
      city: 'Nashville',
      state: 'TN',
      country: 'USA',
      location: 'Nashville, TN',
      lastSeen: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'Vanderbilt Alum | Music Producer',
      about: 'Music production graduate working in Nashville music industry.',
      interests: ['Music Production', 'Country Music', 'Guitar', 'Recording', 'Concerts'],
      mutualInterests: ['Music Production', 'Concerts', 'Guitar'],
      offersRides: false,
      isTrader: true,
      lat: 36.1627,
      lng: -86.7816
    },
    {
      id: 'user-25',
      name: 'Tanya Gupta',
      avatarUrl: 'https://i.pravatar.cc/150?img=32',
      universityId: 'northeastern',
      organization: 'Northeastern University',
      role: 'Student',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      location: 'Boston, MA',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
      badges: { email: true, phone: true, university: true, photo: true },
      tagline: 'NEU Business Analytics | Data enthusiast',
      about: 'Business Analytics grad student. Love Boston sports teams!',
      interests: ['Data Analytics', 'Sports', 'Running', 'Coffee', 'Networking'],
      mutualInterests: ['Coffee', 'Running', 'Data Analytics'],
      hasRoom: true,
      isSenior: false,
      lat: 42.3398,
      lng: -71.0892
    }
  ];

  // Snapshot so we can reliably reset back to the curated base set.
  private readonly baseUsers: DummyUser[] = this.dummyUsers.map(u => ({
    ...u,
    badges: u.badges ? { ...u.badges } : { email: true, phone: false, university: false, photo: true },
    interests: Array.isArray(u.interests) ? [...u.interests] : [],
    mutualInterests: Array.isArray(u.mutualInterests) ? [...u.mutualInterests] : undefined,
    languages: Array.isArray(u.languages) ? [...u.languages] : undefined,
  }));

  constructor() {
    if ((environment as any)?.featureFlags?.useDummyData) {
      this.loadFromStorage();
    }
    this.ensureMinimumUsers(50);
    if ((environment as any)?.featureFlags?.useDummyData) {
      this.saveToStorage();
    }
  }

  /**
   * Dev/demo-only helper: clears persisted dummy users and reseeds a fresh deterministic dataset.
   * Safe to call repeatedly.
   */
  reseed(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // ignore
    }

    this.dummyUsers = this.baseUsers.map(u => ({
      ...u,
      badges: u.badges ? { ...u.badges } : { email: true, phone: false, university: false, photo: true },
      interests: Array.isArray(u.interests) ? [...u.interests] : [],
      mutualInterests: Array.isArray(u.mutualInterests) ? [...u.mutualInterests] : undefined,
      languages: Array.isArray(u.languages) ? [...u.languages] : undefined,
    }));
    this.ensureMinimumUsers(50);
    if ((environment as any)?.featureFlags?.useDummyData) {
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        this.dummyUsers = parsed;
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.dummyUsers));
    } catch {
      // ignore
    }
  }

  private ensureMinimumUsers(min: number) {
    if (this.dummyUsers.length >= min) {
      // Normalize a few fields to keep UI consistent.
      this.dummyUsers = this.dummyUsers.map(u => ({
        ...u,
        languages: Array.isArray(u.languages) && u.languages.length ? u.languages : ['English'],
        badges: u.badges || { email: true, phone: false, university: false, photo: true },
      }));
      return;
    }

    const universities: Array<{ id: string; org: string; city: string; state: string; lat: number; lng: number }> = [
      { id: 'northeastern', org: 'Northeastern University', city: 'Boston', state: 'MA', lat: 42.3398, lng: -71.0892 },
      { id: 'mit', org: 'MIT', city: 'Cambridge', state: 'MA', lat: 42.3601, lng: -71.0942 },
      { id: 'harvard', org: 'Harvard University', city: 'Cambridge', state: 'MA', lat: 42.3770, lng: -71.1167 },
      { id: 'bu', org: 'Boston University', city: 'Boston', state: 'MA', lat: 42.3505, lng: -71.1054 },
      { id: 'yale', org: 'Yale University', city: 'New Haven', state: 'CT', lat: 41.3163, lng: -72.9223 },
      { id: 'unh', org: 'University of New Haven', city: 'West Haven', state: 'CT', lat: 41.2706, lng: -72.9469 },
      { id: 'nyu', org: 'NYU', city: 'New York', state: 'NY', lat: 40.7295, lng: -73.9965 },
      { id: 'columbia', org: 'Columbia University', city: 'New York', state: 'NY', lat: 40.8075, lng: -73.9626 },
      { id: 'stanford', org: 'Stanford University', city: 'Stanford', state: 'CA', lat: 37.4275, lng: -122.1697 },
      { id: 'berkeley', org: 'UC Berkeley', city: 'Berkeley', state: 'CA', lat: 37.8715, lng: -122.2730 },
      { id: 'usc', org: 'USC', city: 'Los Angeles', state: 'CA', lat: 34.0224, lng: -118.2851 },
      { id: 'uw', org: 'University of Washington', city: 'Seattle', state: 'WA', lat: 47.6553, lng: -122.3035 },
      { id: 'princeton', org: 'Princeton University', city: 'Princeton', state: 'NJ', lat: 40.3430, lng: -74.6514 },
    ];

    const firstNames = ['Aarav','Aisha','Akhil','Anaya','Arnav','Diya','Ishaan','Kiran','Maya','Neel','Nisha','Riya','Sahil','Sanya','Varun','Zara','Kabir','Meera','Rohan','Tanvi','Vivek','Ira','Jai','Leena','Naveen','Pooja','Rehan','Siddhi','Tara','Yash'];
    const lastNames = ['Shah','Patel','Reddy','Iyer','Mehta','Kapoor','Nair','Gupta','Singh','Menon','Joshi','Bose','Khan','Chandra','Verma','Das','Kulkarni','Saxena','Bhat','Malhotra'];
    const languagePool = ['English','Hindi','Telugu','Tamil','Gujarati','Marathi','Spanish','French','Mandarin'];
    const interestPool = ['Coffee','Gym','Cooking','Gaming','Photography','Hiking','Startups','Research','Travel','Yoga','Music','Food','Basketball','Cricket','Design','Volunteering','Reading','Networking','Movies','Running'];
    const rolePool = ['Student','Working Professional','Alumni'];

    const uniq = <T>(arr: T[]) => Array.from(new Set(arr));
    const pickN = <T>(arr: T[], n: number, seed: number): T[] => {
      const out: T[] = [];
      for (let i = 0; i < arr.length && out.length < n; i++) {
        const idx = (seed + i * 7) % arr.length;
        const v = arr[idx];
        if (!out.includes(v)) out.push(v);
      }
      return out;
    };

    const nextId = () => {
      const existing = new Set(this.dummyUsers.map(u => u.id));
      for (let i = 1; ; i++) {
        const id = `user-${i}`;
        if (!existing.has(id)) return i;
      }
    };

    // Normalize existing users and then append generated ones.
    this.dummyUsers = this.dummyUsers.map(u => ({
      ...u,
      languages: Array.isArray(u.languages) && u.languages.length ? u.languages : ['English'],
      badges: u.badges || { email: true, phone: false, university: false, photo: true },
    }));

    while (this.dummyUsers.length < min) {
      const i = nextId();
      const uni = universities[i % universities.length];
      const first = firstNames[i % firstNames.length];
      const last = lastNames[(i * 3) % lastNames.length];
      const name = `${first} ${last}`;
      const avatarUrl = `https://i.pravatar.cc/150?img=${(i % 70) + 1}`;
      const role = rolePool[(i * 5) % rolePool.length];
      const interests = pickN(interestPool, 6, i * 11);
      const languages = uniq(pickN(languagePool, 2 + (i % 2), i * 13));
      const lastSeen = new Date(Date.now() - (i % 120) * 60 * 1000).toISOString();

      this.dummyUsers.push({
        id: `user-${i}`,
        name,
        avatarUrl,
        universityId: uni.id,
        organization: uni.org,
        role,
        city: uni.city,
        state: uni.state,
        country: 'USA',
        location: `${uni.city}, ${uni.state}`,
        lastSeen,
        badges: {
          email: true,
          phone: i % 3 !== 0,
          university: role !== 'Working Professional',
          photo: true,
        },
        tagline: `${uni.org.split(' ')[0]} | ${role} | ${interests[0]}`,
        about: `Based in ${uni.city}. Into ${interests.slice(0, 3).join(', ')}.`,
        interests,
        mutualInterests: interests.slice(0, 3),
        languages,
        hasRoom: i % 4 === 0,
        offersRides: i % 6 === 0,
        isTrader: i % 7 === 0,
        isGuide: i % 8 === 0,
        isSenior: i % 9 === 0,
        lat: uni.lat + ((i % 7) - 3) * 0.003,
        lng: uni.lng + ((i % 7) - 3) * 0.003,
      });
    }
  }

  getAllUsers(): DummyUser[] {
    return this.dummyUsers;
  }

  getUsersByUniversity(universityId: string): DummyUser[] {
    return this.dummyUsers.filter(u => u.universityId === universityId);
  }

  getUsersByCity(city: string): DummyUser[] {
    return this.dummyUsers.filter(u => 
      u.city?.toLowerCase() === city.toLowerCase()
    );
  }

  getOnlineUsers(): DummyUser[] {
    return this.dummyUsers.filter(u => this.isUserOnline(u));
  }

  private isUserOnline(user: DummyUser): boolean {
    if (!user.lastSeen) return false;
    const lastSeenTime = new Date(user.lastSeen).getTime();
    const now = Date.now();
    const diffMinutes = (now - lastSeenTime) / (1000 * 60);
    return diffMinutes <= 5;
  }

  getActiveUsers(): DummyUser[] {
    return this.dummyUsers.filter(u => {
      if (!u.lastSeen) return false;
      const lastSeenTime = new Date(u.lastSeen).getTime();
      const now = Date.now();
      const diffMinutes = (now - lastSeenTime) / (1000 * 60);
      return diffMinutes <= 60; // Active in last hour
    });
  }

  getUsersWithMutualInterests(interests: string[]): DummyUser[] {
    return this.dummyUsers.filter(u => 
      u.interests.some(interest => 
        interests.some(myInterest => 
          myInterest.toLowerCase() === interest.toLowerCase()
        )
      )
    );
  }
}
