// types/paymentAssociation.ts

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

export interface IPaymentAssociation {
  id: string;
  amount: number;
  paymentNumber: number;
  description: string;
  paymentDate: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IEarning {
  id: string;
  agentId: string;
  agentName: string;
  intakeId: string;
  intakeName: string;
  universityId: string;
  universityName: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  totalCommission: number;
  commissionCurrency: string;
  commissionPercentage: number;
  remainingAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  payments: IPaymentAssociation[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePaymentAssociation {
  amount: number;
  paymentNumber: number;
  description: string;
  paymentDate: string;
  status: PaymentStatus;
  studentId: string;
  universityId: string;
  agentId: string;
  courseId: string;
  intakeId: string;
}

export interface IUpdatePaymentAssociation {
  amount?: number;
  paymentNumber?: number;
  description?: string;
  paymentDate?: string;
  status?: PaymentStatus;
}

export interface IUpdatePaymentStatus {
  status: PaymentStatus;
}
