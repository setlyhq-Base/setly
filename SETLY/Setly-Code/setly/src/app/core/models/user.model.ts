export interface User {
  id: string;
  name: string;
  photoUrl?: string;
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
