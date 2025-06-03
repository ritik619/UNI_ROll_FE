// types/paymentAssociation.ts

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface IPaymentAssociation {
  id: string;
  courseAssociationId: string; // Link to the CourseAssociation (if payment is for a course)
  studentId?: string; // Optional, if payment linked to a student
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod?: string; // e.g., 'credit_card', 'bank_transfer', 'paypal'
  transactionId?: string; // External payment gateway transaction reference
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string; // Any additional info or remarks
}

export interface ICreatePaymentAssociation {
  courseAssociationId: string;
  studentId?: string;
  amount: number;
  currency: string;
  paymentDate?: Date; // Could default to now
  paymentMethod?: string;
  transactionId?: string;
  status?: PaymentStatus; // Default could be 'pending'
  notes?: string;
}

export interface IUpdatePaymentAssociation {
  amount?: number;
  currency?: string;
  paymentDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
  status?: PaymentStatus;
  notes?: string;
}

export interface IUpdatePaymentStatus {
  status: PaymentStatus;
}
