import mongoose, { Schema, Document, Model } from 'mongoose';

// Marketplace Item Interface
export interface IMarketplaceItem extends Document {
  itemId: string;
  userId: string;
  category: string;
  title: string;
  description: string;
  price: number;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  images: string[];
  location: string;
  tags?: string[];
  status: 'available' | 'sold' | 'reserved';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Marketplace Item Schema
const MarketplaceItemSchema = new Schema<IMarketplaceItem>(
  {
    itemId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, index: true },
    condition: { type: String, required: true, enum: ['new', 'like-new', 'good', 'fair'] },
    images: [{ type: String, required: true }],
    location: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, default: 'available', enum: ['available', 'sold', 'reserved'], index: true },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'marketplace',
  }
);

// Indexes for search performance
MarketplaceItemSchema.index({ userId: 1, status: 1 });
MarketplaceItemSchema.index({ category: 1, status: 1 });
MarketplaceItemSchema.index({ price: 1 });
MarketplaceItemSchema.index({ location: 1 });
MarketplaceItemSchema.index({ createdAt: -1 });

export const MarketplaceItem: Model<IMarketplaceItem> = 
  mongoose.models.MarketplaceItem || mongoose.model<IMarketplaceItem>('MarketplaceItem', MarketplaceItemSchema);
