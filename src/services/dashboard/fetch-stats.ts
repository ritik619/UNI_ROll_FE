import type { DashboardStats, EarningsSummaryResponse } from 'src/types/dashboard';

import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

export const fetchDashboardStats = async (): Promise<
  [
    DashboardStats,
  ]
> => {
  try {
    const response = await authAxiosInstance.get(endpoints.dashboard.stats);
    return [
      response.data,
      ];
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    toast.error('Error fetching dashboard stats!');
    throw err;
  }
};
