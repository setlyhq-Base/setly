export interface Listing {
  id: string;
  title: string;
  price: number;
  deposit: number;
  photos: string[];
  address: string;
  lat: number;
  lng: number;
  nearUniversityIds: string[];
  roomType: 'private' | 'shared';
  bathType: 'private' | 'shared';
  furnished: boolean;
  rules: {
    veg: boolean;
    smoke: boolean;
    pets: boolean;
    genderPreference: 'male' | 'female' | 'any';
  };
  availableFrom: Date;
  minTermMonths?: number;
  listerId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'paused' | 'closed';
}
