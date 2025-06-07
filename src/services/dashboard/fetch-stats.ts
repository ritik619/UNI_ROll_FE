import type { DashboardStats, EarningsSummaryResponse } from 'src/types/dashboard';

import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

export const fetchDashboardStats = async (): Promise<
  [
    DashboardStats,
    EarningsSummaryResponse['earningsByIntake'],
    EarningsSummaryResponse['earningsByUniversity'],
    string,
  ]
> => {
  try {
    const response = await authAxiosInstance.get(endpoints.dashboard.stats);
    const response1: { data: EarningsSummaryResponse } = await authAxiosInstance.get(
      endpoints.earnings.summary
    );
    return [
      response.data,
      response1.data.earningsByIntake,
      response1.data.earningsByUniversity,
      response1.data.currency,
    ];
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    toast.error('Error fetching dashboard stats!');
    throw err;
  }
};
