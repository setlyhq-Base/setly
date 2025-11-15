export interface User {
  id: string;
  name: string;
  photoUrl?: string;
  /** Optional cover/banner image URL */
  coverImageUrl?: string;
  /** Short headline / tagline displayed under name */
  headline?: string;
  primaryEmail: string;
  emailVerified: boolean;
  role: 'student' | 'professional';
  university?: string;
  program?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  graduated?: boolean;
  gradYear?: number;
  company?: string;
  title?: string;
  domainVerified: boolean;
  domainType?: 'university' | 'company' | null;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields for compatibility
  avatar?: string;
  phone?: string;
  phoneVerified?: boolean;
  organization?: Organization;
  graduationYear?: number;
  jobTitle?: string;
  universityEmailVerified?: boolean;
  preferences?: {
    budgetMin?: number; budgetMax?: number;
    vegetarian?: boolean; smoking?: boolean; petsOk?: boolean;
    furnished?: boolean; roomType?: 'private' | 'shared';
  };
  favorites?: string[]; // room ids
  profileVisibility?: {
    about?: boolean;
    travelHistory?: boolean;
    reviews?: boolean;
    interests?: boolean;
    connections?: boolean;
    verification?: boolean;
  };
  /** Unified socials storage (subset may come from backend). */
  socials?: { linkedin?: string; instagram?: string; website?: string; whatsapp?: string };
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  type: 'university' | 'company';
}

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}
