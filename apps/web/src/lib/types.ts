// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  organization_type?: string | null;
  organization_name?: string;
  municipality?: string;
  ngo?: string;
  parent_id?: string | null;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  geofence?: {
    type: 'Polygon' | 'Circle';
    center?: [number, number];
    radius?: number;
    coordinates?: number[][][];
    isActive: boolean;
    alertContacts: Array<{
      name: string;
      phone: string;
      email?: string;
      relationship: string;
    }>;
  };
  phone?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
  riskLevel: 'low' | 'medium' | 'high';
}

// NGO types
export interface NGO {
  _id: string;
  name: string;
  registrationNumber: string;
  type: string;
  focusAreas: string[];
  description: string;
  mission: string;
  vision: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  adminUser: string | User;
  operationalAreas: string[] | Municipality[];
  servicesOffered: string[];
  targetBeneficiaries: string[];
  isActive: boolean;
  isVerified: boolean;
  verificationDate?: Date;
  verifiedBy?: string | User;
  legalInfo: {
    registrationDate: Date;
    registrationState: string;
    panNumber?: string;
    gstNumber?: string;
    fcraNumber?: string;
  };
  certifications: Array<{
    name: string;
    issuingAuthority: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Municipality types
export interface Municipality {
  _id: string;
  name: string;
  code: string;
  type: string;
  state: string;
  district: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    email: string;
    phone: string;
    fax?: string;
    website?: string;
  };
  adminUser: string | User;
  boundaries: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  population?: number;
  area?: number;
  established?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: {
    pagination: PaginationInfo;
  } & Record<string, T[]>;
}

// Specific response types
export interface UsersResponse {
  status: 'success' | 'error';
  message?: string;
  data: {
    users: User[];
    pagination: PaginationInfo;
  };
}

export interface NGOsResponse {
  status: 'success' | 'error';
  message?: string;
  data: {
    ngos: NGO[];
    pagination: PaginationInfo;
  };
}

export interface MunicipalitiesResponse {
  status: 'success' | 'error';
  message?: string;
  data: {
    municipalities: Municipality[];
    pagination: PaginationInfo;
  };
}

// Form types
export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: string;
  organization_type?: string;
  organization_name?: string;
  municipality?: string;
  ngo?: string;
  parent_id?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: [number, number];
  };
  riskLevel?: 'low' | 'medium' | 'high';
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
}

export interface CreateNGOForm {
  name: string;
  registrationNumber: string;
  type: string;
  focusAreas: string[];
  description: string;
  mission: string;
  vision: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  adminUser: string;
  operationalAreas: string[];
  servicesOffered: string[];
  targetBeneficiaries: string[];
  legalInfo: {
    registrationDate: Date;
    registrationState: string;
    panNumber?: string;
    gstNumber?: string;
    fcraNumber?: string;
  };
}

export interface CreateMunicipalityForm {
  name: string;
  code: string;
  type: string;
  state: string;
  district: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    email: string;
    phone: string;
    fax?: string;
    website?: string;
  };
  adminUser: string;
  population?: number;
  area?: number;
  established?: Date;
}
