import mongoose, { Schema, Document, Model } from 'mongoose';

// Message Interface
export interface IMessage {
  messageId: string;
  senderId: string;
  text: string;
  read: boolean;
  createdAt: Date;
}

// Conversation Interface
export interface IConversation extends Document {
  conversationId: string;
  participants: string[]; // Array of user IDs
  listingId?: string;
  listingType?: 'room' | 'ride' | 'marketplace';
  listingTitle?: string;
  listingImage?: string;
  messages: IMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message Sub-Schema
const MessageSchema = new Schema<IMessage>(
  {
    messageId: { type: String, required: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Conversation Schema
const ConversationSchema = new Schema<IConversation>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    participants: [{ type: String, required: true, index: true }],
    listingId: { type: String, index: true },
    listingType: { type: String, enum: ['room', 'ride', 'marketplace'] },
    listingTitle: { type: String },
    listingImage: { type: String },
    messages: [MessageSchema],
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    collection: 'conversations',
  }
);

// Indexes for performance
ConversationSchema.index({ participants: 1, lastMessageAt: -1 });
ConversationSchema.index({ conversationId: 1 });
ConversationSchema.index({ listingId: 1 });

export const Conversation: Model<IConversation> = 
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
