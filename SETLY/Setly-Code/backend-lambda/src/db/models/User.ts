import mongoose, { Schema, Document, Model } from 'mongoose';

// User Interface
export interface IUser extends Document {
  userId: string;
  email: string;
  name: string;
  photoUrl?: string;
  phone?: string;
  bio?: string;
  university?: string;
  graduationYear?: number;
  major?: string;
  verified: boolean;
  verificationBadge?: 'student' | 'alumni' | 'verified';
  preferredCities?: string[];
  savedRooms: string[];
  savedRides: string[];
  savedMarketplace: string[];
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    photoUrl: { type: String },
    phone: { type: String },
    bio: { type: String },
    university: { type: String },
    graduationYear: { type: Number },
    major: { type: String },
    verified: { type: Boolean, default: false },
    verificationBadge: { type: String, enum: ['student', 'alumni', 'verified'] },
    preferredCities: [{ type: String }],
    savedRooms: [{ type: String }],
    savedRides: [{ type: String }],
    savedMarketplace: [{ type: String }],
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

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
