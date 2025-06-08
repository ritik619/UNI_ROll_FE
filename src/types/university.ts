import type { IDateValue, ISocialLink } from './common';

// ----------------------------------------------------------------------

export type IUniversityTableFilters = {
  name: string;
  role: string[];
  status: 'all' | 'active' | 'inactive';
  cityId: string;
  countryCode: string;
};

export type IUniversity = {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  description?: string;
  website?: string;
  logoUrl?: string | File | null;
  status: 'active' | 'inactive';
  totalAmount?: number;
  paidAmount?: number;
  pendingAmount?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ICreateUniversity = {
  name: string;
  cityId: string;
  description?: string;
  website?: string;
  logoUrl?: string | File | null;
  status?: 'active' | 'inactive';
};

export type IUpdateUniversity = {
  name?: string;
  cityId?: string;
  description?: string;
  website?: string;
  logoUrl?: string | File | null;
  status?: 'active' | 'inactive';
};

export type IUpdateUniversityStatus = {
  status: 'active' | 'inactive';
};

// For backward compatibility, keeping some of the existing types
// These can be cleaned up later if not needed

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUserItem = {
  id: string;
  avatarUrl: string | File | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  bankDetails: {
    sortCode: string;
    accountNumber: string;
  };
  email: string;
  address: string;
  postCode: string;
  utrNumber: string;
  password: string;
  status: 'active' | 'inactive';
};

export type IUserAccountBillingHistory = {
  id: string;
  price: number;
  invoiceNumber: string;
  createdAt: IDateValue;
};
