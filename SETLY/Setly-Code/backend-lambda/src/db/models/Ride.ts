import mongoose, { Schema, Document, Model } from 'mongoose';

// Ride Interface
export interface IRide extends Document {
  rideId: string;
  userId: string;
  type: 'driver' | 'seeker'; // Post type: driver offering ride vs. seeker looking for ride
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  rideDate: Date;
  departureTime: string; // Pickup time
  arrivalTime?: string; // Drop-off time (driver posts only)
  seatsAvailable?: number;
  pricePerSeat?: number;
  images?: string[];
  notes?: string;
  tags?: string[]; // nearby, today, shared, airport, top-rated
  isFallback?: boolean; // Mark as fallback sample data
  user?: {
    name: string;
    avatar?: string;
    online?: boolean;
  };
  status: 'active' | 'completed' | 'cancelled';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Ride Schema
const RideSchema = new Schema<IRide>(
  {
    rideId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['driver', 'seeker'], index: true },
    pickupAddress: { type: String, required: true },
    pickupLat: { type: Number, required: true },
    pickupLng: { type: Number, required: true },
    dropoffAddress: { type: String, required: true },
    dropoffLat: { type: Number, required: true },
    dropoffLng: { type: Number, required: true },
    rideDate: { type: Date, required: true, index: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String },
    seatsAvailable: { type: Number },
    pricePerSeat: { type: Number },
    images: [{ type: String }],
    notes: { type: String },
    tags: [{ type: String, index: true }],
    isFallback: { type: Boolean, default: false, index: true },
    user: {
      name: { type: String },
      avatar: { type: String },
      online: { type: Boolean }
    },
    status: { type: String, default: 'active', enum: ['active', 'completed', 'cancelled'], index: true },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'rides',
  }
);

// Indexes for search performance
RideSchema.index({ userId: 1, status: 1 });
RideSchema.index({ type: 1, status: 1 });
RideSchema.index({ rideDate: 1, status: 1 });
RideSchema.index({ tags: 1, status: 1 });
RideSchema.index({ isFallback: 1, status: 1 });
RideSchema.index({ createdAt: -1 });
RideSchema.index({ pickupLat: 1, pickupLng: 1 });
RideSchema.index({ dropoffLat: 1, dropoffLng: 1 });

export const Ride: Model<IRide> = mongoose.models.Ride || mongoose.model<IRide>('Ride', RideSchema);
