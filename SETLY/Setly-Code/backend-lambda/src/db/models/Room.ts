import mongoose, { Schema, Document, Model } from 'mongoose';

// Room Interface
export interface IRoom extends Document {
  roomId: string;
  userId: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  price: number;
  deposit?: number;
  images: string[];
  roomType: 'private' | 'shared';
  bathType: 'private' | 'shared';
  furnished: boolean;
  utilities: string[];
  amenities: string[];
  rules: {
    vegetarian?: boolean;
    smoking?: boolean;
    petsOk?: boolean;
    [key: string]: any;
  };
  availabilityStart?: Date;
  availabilityEnd?: Date;
  maxGuests?: number;
  minStayDays?: number;
  universityId?: string;
  distanceKm?: number;
  coords?: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'rented' | 'expired';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Room Schema
const RoomSchema = new Schema<IRoom>(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    zipCode: { type: String },
    price: { type: Number, required: true, index: true },
    deposit: { type: Number },
    images: [{ type: String }],
    roomType: { type: String, required: true, enum: ['private', 'shared'] },
    bathType: { type: String, required: true, enum: ['private', 'shared'] },
    furnished: { type: Boolean, default: false },
    utilities: [{ type: String }],
    amenities: [{ type: String }],
    rules: {
      type: Schema.Types.Mixed,
      default: {},
    },
    availabilityStart: { type: Date },
    availabilityEnd: { type: Date },
    maxGuests: { type: Number },
    minStayDays: { type: Number },
    universityId: { type: String, index: true },
    distanceKm: { type: Number },
    coords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    status: { type: String, default: 'active', enum: ['active', 'rented', 'expired'], index: true },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'rooms',
  }
);

// Indexes for search performance
RoomSchema.index({ city: 1, status: 1 });
RoomSchema.index({ userId: 1, status: 1 });
RoomSchema.index({ price: 1 });
RoomSchema.index({ createdAt: -1 });
RoomSchema.index({ availabilityStart: 1, availabilityEnd: 1 });

export const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
