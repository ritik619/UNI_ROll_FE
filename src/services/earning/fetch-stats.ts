import type { EarningsSummaryResponse } from 'src/types/dashboard';

import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

export const fetchEarningStats = async (isAdmin: boolean = true): Promise<
  [
    EarningsSummaryResponse['earningsByIntake'],
    EarningsSummaryResponse['earningsByUniversity'],
    string,
  ]
> => {
  try {
    const response1: { data: EarningsSummaryResponse } = await authAxiosInstance.get(
      isAdmin ? endpoints.earnings.summary : endpoints.earnings.agenetSummary
    );
    return [
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
