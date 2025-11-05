export interface RiderProfile {
  userId: string;
  enabled: boolean;
  availableNow: boolean;
  schedule?: Array<{ dow: 0 | 1 | 2 | 3 | 4 | 5 | 6; start: string; end: string }>;
  radiusKm: number;
  accepted: { ride: boolean; groceries: boolean; courier: boolean };
  contact: { via: 'inapp' | 'phone' | 'email'; value?: string };
  vehicle?: { type?: string; seats?: number };
  universityId?: string;
  updatedAt: string;
}

export interface RiderMatch {
  userId: string;
  distanceKm?: number;
  acceptedTask: 'ride' | 'groceries' | 'courier';
}
