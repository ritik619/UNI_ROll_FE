import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IIntakeTableFilters = {
  name: string;
  status: 'all' | 'active' | 'inactive';
};

export type IIntake = {
  id:string;
  name?: string;
  startDate: string;
  endDate: string;
  description?: string;
  status?: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
};

export type ICreateIntake = {
  name?: string;
  startDate: string;
  endDate: string;
  description?: string;
  status?: 'active' | 'inactive';
};

export type IUpdateIntake = {
  name?: string;
  startDate:string;
  endDate:string;
  description?: string;
  status?: 'active' | 'inactive';
};

export type IUpdateCourseStatus = {
  status: 'active' | 'inactive';
};
