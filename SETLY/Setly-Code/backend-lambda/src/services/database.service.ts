import { connectToDatabase } from '../db/connection';
import { Room, Ride, MarketplaceItem, User, Conversation, IMessage } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * Database Service using MongoDB
 * Implements all CRUD operations for Setly backend
 */
class DatabaseService {
  // ====== ROOMS ======

  async searchRooms(filters: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    roomType?: string;
    userId?: string;
  }) {
    await connectToDatabase();

    const query: any = { status: 'active' };

    if (filters.city) {
      query.city = new RegExp(filters.city, 'i');
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    if (filters.roomType) {
      query.roomType = filters.roomType;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 }).limit(100).lean();
    return rooms.map((r: any) => ({ ...r, id: r.roomId, _id: undefined, __v: undefined }));
  }

  async getRoomById(roomId: string) {
    await connectToDatabase();
    const room = await Room.findOne({ roomId }).lean();
    if (!room) return null;
    
    // Increment views
    await Room.updateOne({ roomId }, { $inc: { views: 1 } });
    
    return { ...room, id: (room as any).roomId, _id: undefined, __v: undefined };
  }

  async createRoom(data: any) {
    await connectToDatabase();
    const roomId = data.roomId || uuidv4();
    
    const room = new Room({
      roomId,
      ...data,
      status: data.status || 'active',
      views: 0,
    });

    await room.save();
    return { ...room.toObject(), id: roomId, _id: undefined, __v: undefined };
  }

  async updateRoom(roomId: string, updates: any) {
    await connectToDatabase();
    const room = await Room.findOneAndUpdate(
      { roomId },
      { $set: updates },
      { new: true }
    ).lean();

    if (!room) return null;
    return { ...room, id: (room as any).roomId, _id: undefined, __v: undefined };
  }

  async deleteRoom(roomId: string) {
    await connectToDatabase();
    await Room.updateOne({ roomId }, { $set: { status: 'expired' } });
    return true;
  }

  // ====== RIDES ======

  async searchRides(filters: {
    pickupCity?: string;
    dropoffCity?: string;
    rideDate?: Date;
    userId?: string;
  }) {
    await connectToDatabase();

    const query: any = { status: 'active' };

    if (filters.pickupCity) {
      query.pickupAddress = new RegExp(filters.pickupCity, 'i');
    }

    if (filters.dropoffCity) {
      query.dropoffAddress = new RegExp(filters.dropoffCity, 'i');
    }

    if (filters.rideDate) {
      const date = new Date(filters.rideDate);
      query.rideDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    const rides = await Ride.find(query).sort({ rideDate: 1 }).limit(100).lean();
    return rides.map((r: any) => ({ ...r, id: r.rideId, _id: undefined, __v: undefined }));
  }

  async getRideById(rideId: string) {
    await connectToDatabase();
    const ride = await Ride.findOne({ rideId }).lean();
    if (!ride) return null;

    await Ride.updateOne({ rideId }, { $inc: { views: 1 } });
    return { ...ride, id: (ride as any).rideId, _id: undefined, __v: undefined };
  }

  async createRide(data: any) {
    await connectToDatabase();
    const rideId = data.rideId || uuidv4();

    const ride = new Ride({
      rideId,
      ...data,
      status: data.status || 'active',
      views: 0,
    });

    await ride.save();
    return { ...ride.toObject(), id: rideId, _id: undefined, __v: undefined };
  }

  async updateRide(rideId: string, updates: any) {
    await connectToDatabase();
    const ride = await Ride.findOneAndUpdate(
      { rideId },
      { $set: updates },
      { new: true }
    ).lean();

    if (!ride) return null;
    return { ...ride, id: (ride as any).rideId, _id: undefined, __v: undefined };
  }

  async deleteRide(rideId: string) {
    await connectToDatabase();
    await Ride.updateOne({ rideId }, { $set: { status: 'cancelled' } });
    return true;
  }

  // ====== MARKETPLACE ======

  async searchMarketplaceItems(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
    condition?: string;
    location?: string;
    userId?: string;
  }) {
    await connectToDatabase();

    const query: any = { status: 'available' };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    if (filters.searchTerm) {
      query.$or = [
        { title: new RegExp(filters.searchTerm, 'i') },
        { description: new RegExp(filters.searchTerm, 'i') },
      ];
    }

    if (filters.condition) {
      query.condition = filters.condition;
    }

    if (filters.location) {
      query.location = new RegExp(filters.location, 'i');
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    const items = await MarketplaceItem.find(query).sort({ createdAt: -1 }).limit(100).lean();
    return items.map((i: any) => ({ ...i, id: i.itemId, _id: undefined, __v: undefined }));
  }

  async getMarketplaceItemById(itemId: string) {
    await connectToDatabase();
    const item = await MarketplaceItem.findOne({ itemId }).lean();
    if (!item) return null;

    await MarketplaceItem.updateOne({ itemId }, { $inc: { views: 1 } });
    return { ...item, id: (item as any).itemId, _id: undefined, __v: undefined };
  }

  async createMarketplaceItem(data: any) {
    await connectToDatabase();
    const itemId = data.itemId || uuidv4();

    const item = new MarketplaceItem({
      itemId,
      ...data,
      status: data.status || 'available',
      views: 0,
    });

    await item.save();
    return { ...item.toObject(), id: itemId, _id: undefined, __v: undefined };
  }

  async updateMarketplaceItem(itemId: string, updates: any) {
    await connectToDatabase();
    const item = await MarketplaceItem.findOneAndUpdate(
      { itemId },
      { $set: updates },
      { new: true }
    ).lean();

    if (!item) return null;
    return { ...item, id: (item as any).itemId, _id: undefined, __v: undefined };
  }

  async deleteMarketplaceItem(itemId: string) {
    await connectToDatabase();
    await MarketplaceItem.updateOne({ itemId }, { $set: { status: 'sold' } });
    return true;
  }

  // ====== USERS ======

  async getUserById(userId: string) {
    await connectToDatabase();
    const user = await User.findOne({ userId }).lean();
    if (!user) return null;
    return { ...user, id: (user as any).userId, _id: undefined, __v: undefined };
  }

  async getUserByEmail(email: string) {
    await connectToDatabase();
    const user = await User.findOne({ email }).lean();
    if (!user) return null;
    return { ...user, id: (user as any).userId, _id: undefined, __v: undefined };
  }

  async createUser(data: any) {
    await connectToDatabase();
    const userId = data.userId || uuidv4();

    const user = new User({
      userId,
      ...data,
      savedRooms: [],
      savedRides: [],
      savedMarketplace: [],
      verified: false,
    });

    await user.save();
    return { ...user.toObject(), id: userId, _id: undefined, __v: undefined };
  }

  async updateUser(userId: string, updates: any) {
    await connectToDatabase();
    const user = await User.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    ).lean();

    if (!user) return null;
    return { ...user, id: (user as any).userId, _id: undefined, __v: undefined };
  }

  async saveRoom(userId: string, roomId: string) {
    await connectToDatabase();
    await User.updateOne(
      { userId },
      { $addToSet: { savedRooms: roomId } }
    );
    return true;
  }

  async unsaveRoom(userId: string, roomId: string) {
    await connectToDatabase();
    await User.updateOne(
      { userId },
      { $pull: { savedRooms: roomId } }
    );
    return true;
  }

  async saveRide(userId: string, rideId: string) {
    await connectToDatabase();
    await User.updateOne(
      { userId },
      { $addToSet: { savedRides: rideId } }
    );
    return true;
  }

  async unsaveRide(userId: string, rideId: string) {
    await connectToDatabase();
    await User.updateOne(
      { userId },
      { $pull: { savedRides: rideId } }
    );
    return true;
  }

  async saveMarketplaceItem(userId: string, itemId: string) {
    await connectToDatabase();
    await User.updateOne(
      { userId },
      { $addToSet: { savedMarketplace: itemId } }
    );
    return true;
  }

  async unsaveMarketplaceItem(userId: string, itemId: string) {
    await connectToDatabase();
    await User.updateOne(
      { userId },
      { $pull: { savedMarketplace: itemId } }
    );
    return true;
  }

  async getSavedItems(userId: string) {
    await connectToDatabase();
    const user = await User.findOne({ userId }).select('savedRooms savedRides savedMarketplace').lean();
    if (!user) {
      return { rooms: [], rides: [], marketplace: [] };
    }
    return {
      rooms: (user as any).savedRooms || [],
      rides: (user as any).savedRides || [],
      marketplace: (user as any).savedMarketplace || [],
    };
  }

  // ====== CONVERSATIONS/MESSAGES ======

  async createConversation(data: {
    participants: string[];
    listingId?: string;
    listingType?: 'room' | 'ride' | 'marketplace';
    listingTitle?: string;
    listingImage?: string;
  }) {
    await connectToDatabase();

    // Check if conversation already exists
    const existing = await Conversation.findOne({
      participants: { $all: data.participants },
      listingId: data.listingId,
    }).lean();

    if (existing) {
      return { ...existing, id: (existing as any).conversationId, _id: undefined, __v: undefined };
    }

    const conversationId = uuidv4();
    const conversation = new Conversation({
      conversationId,
      ...data,
      messages: [],
      lastMessageAt: new Date(),
    });

    await conversation.save();
    return { ...conversation.toObject(), id: conversationId, _id: undefined, __v: undefined };
  }

  async getConversationsByUser(userId: string) {
    await connectToDatabase();
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    return conversations.map((c: any) => ({ ...c, id: c.conversationId, _id: undefined, __v: undefined }));
  }

  async getConversationById(conversationId: string) {
    await connectToDatabase();
    const conversation = await Conversation.findOne({ conversationId }).lean();
    if (!conversation) return null;
    return { ...conversation, id: (conversation as any).conversationId, _id: undefined, __v: undefined };
  }

  async sendMessage(conversationId: string, senderId: string, text: string) {
    await connectToDatabase();

    const messageId = uuidv4();
    const message: IMessage = {
      messageId,
      senderId,
      text,
      read: false,
      createdAt: new Date(),
    };

    await Conversation.updateOne(
      { conversationId },
      {
        $push: { messages: message },
        $set: { lastMessageAt: new Date() },
      }
    );

    return message;
  }

  async markMessageAsRead(conversationId: string, messageId: string) {
    await connectToDatabase();
    await Conversation.updateOne(
      { conversationId, 'messages.messageId': messageId },
      { $set: { 'messages.$.read': true } }
    );
    return true;
  }

  async markConversationAsRead(conversationId: string, userId: string) {
    await connectToDatabase();
    await Conversation.updateOne(
      { conversationId },
      { $set: { 'messages.$[elem].read': true } },
      { arrayFilters: [{ 'elem.senderId': { $ne: userId } }] }
    );
    return true;
  }

  async deleteConversation(conversationId: string) {
    await connectToDatabase();
    await Conversation.deleteOne({ conversationId });
    return true;
  }
}

export const dbService = new DatabaseService();
