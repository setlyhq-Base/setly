import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

// User Interface
export interface IUser extends Document {
  userId: string;
  email: string;
  password?: string; // Optional - only for email/password auth
  name: string;
  photoUrl?: string;
  coverImageUrl?: string;
  headline?: string;
  phone?: string;
  bio?: string;
  city?: string;
  state?: string;
  university?: string;
  graduationYear?: number;
  major?: string;
  company?: string;
  title?: string;
  role?: 'student' | 'professional';
  verified: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  domainVerified?: boolean;
  domainType?: 'university' | 'company' | null;
  verificationBadge?: 'student' | 'alumni' | 'verified';
  languages?: string[];
  interests?: string[];
  preferredCities?: string[];
  savedRooms: string[];
  savedRides: string[];
  savedMarketplace: string[];
  profileVisibility?: {
    about?: boolean;
    travelHistory?: boolean;
    reviews?: boolean;
    interests?: boolean;
    connections?: boolean;
    verification?: boolean;
  };
  lastLoginAt?: Date;
  isProfileComplete?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, select: false }, // Don't return password by default
    name: { type: String, required: true },
    photoUrl: { type: String },
    coverImageUrl: { type: String },
    headline: { type: String },
    phone: { type: String },
    bio: { type: String },
    city: { type: String },
    state: { type: String },
    university: { type: String },
    graduationYear: { type: Number },
    major: { type: String },
    company: { type: String },
    title: { type: String },
    role: { type: String, enum: ['student', 'professional'] },
    verified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    domainVerified: { type: Boolean, default: false },
    domainType: { type: String, enum: ['university', 'company', null], default: null },
    verificationBadge: { type: String, enum: ['student', 'alumni', 'verified'] },
    languages: [{ type: String }],
    interests: [{ type: String }],
    preferredCities: [{ type: String }],
    savedRooms: [{ type: String }],
    savedRides: [{ type: String }],
    savedMarketplace: [{ type: String }],
    profileVisibility: {
      about: { type: Boolean, default: true },
      travelHistory: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      interests: { type: Boolean, default: true },
      connections: { type: Boolean, default: true },
      verification: { type: Boolean, default: true }
    },
    lastLoginAt: { type: Date },
    isProfileComplete: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ userId: 1 });
UserSchema.index({ createdAt: -1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
