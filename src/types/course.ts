import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type ICourseTableFilters = {
  name: string;
  status: 'all' | 'active' | 'inactive';
  cityId: string;
  countryCode: string;
  universityId: string;
  role: string[];
};

export type ICourse = {
  cityName: string;
  countryName: string;
  id: string;
  name: string;
  code?: string;
  universityId: string;
  universityName: string;
  description?: string;
  durationMonths?: number; // Total months for duration
  tuitionFee?: number;
  startDates?: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
};

export type ICreateCourse = {
  name: string;
  code: string;
  universityId: string;
  description?: string;
  durationYears?: number; // For UI only
  durationMonths?: number; // Backend will only receive total months
  tuitionFee?: number;
  startDates?: string[];
  status?: 'active' | 'inactive';
};

export type IUpdateCourse = {
  name?: string;
  code?: string;
  universityId?: string;
  description?: string;
  durationMonths?: number; // Total duration in months
  tuitionFee?: number;
  startDates?: string[];
  status?: 'active' | 'inactive';
};

export type IUpdateCourseStatus = {
  status: 'active' | 'inactive';
};
