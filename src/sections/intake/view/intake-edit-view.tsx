'use client';

import type { IIntake } from 'src/types/intake';

import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { IntakeNewEditForm } from './intake-new-edit-form';

// Mock data - will use real API in production
const MOCK_COURSES: { [key: string]: IIntake } = {
  'intake-1': {
    id: 'intake-1',
    name: 'Bachelor of Computer Science',
    description:
      'A comprehensive program covering fundamentals of computer science, algorithms, and software development.',
    startDate: '2023-09-01',
    endDate: '2024-01-15',
    status: 'active',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-03-20'),
  },
  'intake-2': {
    id: 'intake-2',
    name: 'Bachelor of Computer Science',
    description:
      'A comprehensive program covering fundamentals of computer science, algorithms, and software development.',
    startDate: '2023-09-01',
    endDate: '2024-01-15',
    status: 'active',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-03-20'),
  },
};

// ----------------------------------------------------------------------

type Props = {
  intakeId: string;
};

export default function IntakeEditView({ intakeId }: Props) {
  const router = useRouter();
  const [intake, setIntake] = useState<IIntake | null>(null);
  const [loading, setLoading] = useState(true);

  const getIntake = useCallback(async () => {
    setLoading(true);
    try {
      // For production, this would be a real API call:
      const response = await authAxiosInstance.get(`${endpoints.intakes.details(intakeId)}`);
      console.log('Intake response:', response.data);
      setIntake(response.data);
    } catch (error) {
      console.error('Failed to fetch intake:', error);
      toast.error('Failed to fetch intake details');
      router.push(paths.dashboard.intakes.root);
    } finally {
      setLoading(false);
    }
  }, [intakeId, router]);

  useEffect(() => {
    getIntake();
  }, [getIntake]);

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 3,
          textAlign: 'center',
          height: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!intake) {
    return <></>;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Intake"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Intakes', href: paths.dashboard.intakes.root },
          { name: 'Edit Intake' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <IntakeNewEditForm currentIntake={intake} />
    </DashboardContent>
  );
}
