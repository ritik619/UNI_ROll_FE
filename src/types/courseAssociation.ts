// types/courseAssociation.ts

export type CourseAssociationStatus = 'active' | 'inactive' | 'upcoming' | 'completed';

export interface ICourseAssociation {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  universityId: string;
  universityName: string;
  startDate: Date;
  endDate: Date;
  price: number;
  currency?: string;
  applicationDeadline?: Date;
  requirementsDescription?: string;
  languageOfInstruction?: string;
  maxStudents?: number;
  availableSeats?: number;
  status: CourseAssociationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCourseAssociation {
  courseId: string;
  universityId: string;
  startDate?: Date;
  endDate?: Date;
  price?: number;
  currency?: string;
  applicationDeadline?: Date;
  requirementsDescription?: string;
  languageOfInstruction?: string;
  maxStudents?: number;
  availableSeats?: number;
  status?: CourseAssociationStatus;
}

export interface IUpdateCourseAssociation {
  startDate?: Date;
  endDate?: Date;
  price?: number;
  currency?: string;
  applicationDeadline?: Date;
  requirementsDescription?: string;
  languageOfInstruction?: string;
  maxStudents?: number;
  availableSeats?: number;
  status?: CourseAssociationStatus;
}

export interface IUpdateCourseAssociationStatus {
  status: CourseAssociationStatus;
}
