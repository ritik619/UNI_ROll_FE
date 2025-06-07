export interface DashboardStats {
  totalStudents: number;
  enrolledStudents: number;
  unenrolledStudents: number;
  totalAgents: number;
  totalEarnings: number;
  totalUniversities: number;
  totalCourses: number;
} 

export type EarningsSummaryResponse = {
  totalEarnings: number;
  paidAmount: number;
  pendingAmount: number;
  currency: string;
  earningsByIntake: {
    intakeId: string;
    intakeName: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }[];
  earningsByUniversity: {
    universityId: string;
    universityName: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }[];
};