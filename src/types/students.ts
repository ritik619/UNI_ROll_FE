import type { IDateValue, ISocialLink } from './common';

// ----------------------------------------------------------------------

export type IStudentsTableFilters = {
  name: string;
  role: string[];
  status: 'all' | 'free' | 'interested' | 'enrolled' | 'unenrolled';
};

export type IStudentsProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type IStudentsProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  university: string;
  country: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: ISocialLink;
};

export type IStudentsProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IStudentsProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: IDateValue;
};

export type IStudentsProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IStudentsProfilePost = {
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

export type IStudentsCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IStudentsItem = {
  id: string;
  avatarUrl: string | File | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  address: string;
  university: string;
  courses: string;
  status: 'free' | 'interested' | 'enrolled' | 'unenrolled';
};

// export type IStudentsAccountBillingHistory = {
//   id: string;
//   price: number;
//   invoiceNumber: string;
//   createdAt: IDateValue;
// };
