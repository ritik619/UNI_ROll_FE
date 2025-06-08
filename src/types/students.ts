// students.types.ts

export type ISex = 'Male' | 'Female' | 'Other';
export type IStudentStatus =
  | 'Enrolled'
  | 'UnEnrolled'
  | 'Withdrawn'
  | 'Deferred'
  | 'Unaffiliated'
  | 'All';
export type IFinanceStatus = 'Applied' | 'Approved';

export interface IDocuments {
  passport?: string;
  shareCode?: string;
  proofOfAddress?: string;
  diploma?: string;
  personalStatement?: string;
  cv?: string;
  otherDocuments?: string[];
}
export type IStudentsTableFilters = {
  name: string;
  role: string[];
  status: IStudentStatus;
  countryCode: string;
  universityId: string;
  courseId: string;
  cityId: string;
  agentId: string;
  intakeId: string;
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
export interface IFinance {
  status: IFinanceStatus;
}

export interface IBooking {
  examDate?: Date;
  examTime?: string;
  examRoom?: string;
}

export interface IConsent {
  sent: boolean;
  sentTime?: Date;
  signed: boolean;
  accepted: boolean;
}

export interface IStudentsItem {
  id: string;
  leadNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phonePrefix: string;
  phoneNumber: string;
  nationality: string;
  coverPhoto: string;
  sex: ISex;
  address: string;
  postCode: string;
  agentId: string;
  universityId?: string;
  universityName?: string;
  courseName?: string;
  courseId?: string;
  intakeId?: string;
  status: IStudentStatus;
  documents?: IDocuments;
  finance?: IFinance;
  booking?: IBooking;
  consent?: IConsent;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateStudent {
  leadNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // DD/MM/YYYY
  age?: number;
  email: string;
  phonePrefix: string;
  phoneNumber: string;
  nationality: string;
  sex: ISex;
  address: string;
  postCode?: string;
  agentId: string;
}

export interface IUpdateStudent {
  leadNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  email?: string;
  phonePrefix?: string;
  phoneNumber?: string;
  nationality?: string;
  sex?: ISex;
  address?: string;
  postCode?: string;
  agentId?: string;
  status?: IStudentStatus;
}

export interface IUpdateStudentStatus {
  status: IStudentStatus;
}

export interface IUpdateConsent {
  sent: boolean;
}

export interface IEnrollStudent {
  intakeId: string;
  universityId: string;
  courseId: string;
}

export interface IRemoveIntakeLink {
  studentId: string;
}
