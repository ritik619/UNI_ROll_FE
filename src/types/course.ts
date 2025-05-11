import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type ICourseTableFilters = {
  name: string;
  status: 'all' | 'active' | 'inactive';
  universityId: string;
};

export type ICourse = {
  id: string;
  name: string;
  code: string;
  universityId: string;
  universityName: string;
  description?: string;
  durationYears?: number;
  durationMonths?: number;
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
  durationYears?: number;
  durationMonths?: number;
  tuitionFee?: number;
  startDates?: string[];
  status?: 'active' | 'inactive';
};

export type IUpdateCourse = {
  name?: string;
  code?: string;
  universityId?: string;
  description?: string;
  durationYears?: number;
  durationMonths?: number;
  tuitionFee?: number;
  startDates?: string[];
  status?: 'active' | 'inactive';
};

export type IUpdateCourseStatus = {
  status: 'active' | 'inactive';
};