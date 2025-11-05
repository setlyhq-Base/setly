export interface RideRequest {
  id: string;
  type: 'peer';
  pickup: string;
  drop: string;
  when: { mode: 'now' | 'schedule'; iso?: string };
  seats: number;
  luggage: boolean;
  notes?: string;
  contact: { via: 'inapp' | 'phone' | 'email'; value?: string };
  audience: { mode: 'contacts' | 'university' | 'peer'; peerId?: string; universityId?: string };
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  requesterId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RideFeedPost {
  id: string;
  rideRequestId: string;
  universityId: string;
  createdAt: string;
}
