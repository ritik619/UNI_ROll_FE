'use client';

import type { DashboardStats, EarningsSummaryResponse } from 'src/types/dashboard';

import { useState, useEffect } from 'react';

import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { fetchEarningStats } from 'src/services/earning/fetch-stats';

import { AppRecentIntakeEarnings } from './recent-intakes';
import { AppTopUniversityEarnings } from './top-earning-university';
import { UniversityListView } from '../universities/view/university-list-view';
import { AgentListView } from '../agent/view';
import { IntakeListView } from '../intake/view/intake-list-view';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function EarningView() {
  const { user } = useAuthContext();
  const userRole = user?.role;
  const isAdmin = userRole == 'admin';
  const [earningsByIntake, setEarningsByIntake] = useState<
    EarningsSummaryResponse['earningsByIntake']
  >([]);
  const [earningsByUniversity, setEarningsByUniversity] = useState<
    EarningsSummaryResponse['earningsByUniversity']
  >([]);
  const [currencyCode, setCurrencyCode] = useState<string>('GBP');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchEarningStats(isAdmin);
        setEarningsByIntake(data[0] ?? []);
        setEarningsByUniversity(data[1] ?? []);
        setCurrencyCode(data[2]);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // You might want to show an error message to the user here
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <DashboardContent>
        <Stack spacing={3}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Earning Overview
          </Typography>

          <Card sx={{ p: 3 }}></Card>
        </Stack>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Earning Overview
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppRecentIntakeEarnings
              title="Recent Intake Earnings"
              list={earningsByIntake}
              currencyCode="GBP"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <AppTopUniversityEarnings
              title="Top Earning Universities"
              list={earningsByUniversity}
              currencyCode={"GBP"}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <UniversityListView earning={true} />
        </Grid>
        {isAdmin && (
          <Grid container spacing={3}>
            <AgentListView earning={true} />
          </Grid>
        )}
        <Grid container spacing={3}>
          <IntakeListView earning={true} />
        </Grid>
      </Stack>
    </DashboardContent>
  );
}
