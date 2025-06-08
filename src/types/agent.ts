import type { IDateValue, ISocialLink } from './common';

// ----------------------------------------------------------------------

export type IAgentTableFilters = {
  name: string;
  role: string[];
  status: 'all' | 'active' | 'inactive';
};

export type IAgentProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type IAgentProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: ISocialLink;
};

export type IAgentProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IAgentProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: IDateValue;
};

export type IAgentProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IAgentProfilePost = {
  id: string;
  media: string;
  message: string;
  createdAt: IDateValue;
  personLikes: { name: string; avatarUrl: string }[];
  comments: {
    id: string;
    message: string;
    createdAt: IDateValue;
    author: { id: string; name: string; avatarUrl: string };
  }[];
};

export type IAgentCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IAgentItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  utrNumber: string;
  bankDetails: {
    sortCode: string;
    accountNumber: string;
  };
  postCode: string;
  status: 'active' | 'inactive';
  totalAmount?: number;
  paidAmount?: number;
  pendingAmount?: number;
  name?: string;
  role?: string;
  accessControl?: {
    unc: boolean;
    intake: boolean;
  };
};

export type IAgentAccountBillingHistory = {
  id: string;
  price: number;
  invoiceNumber: string;
  createdAt: IDateValue;
};
