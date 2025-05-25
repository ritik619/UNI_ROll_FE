'use client';

import type { IStudentsItem } from 'src/types/students';

import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StudentsNewEditForm } from '../students-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  studentId: string;
};

export function StudentsEditView({ studentId }: Props) {
  const router = useRouter();
  const [student, setStudent] = useState<IStudentsItem | null>(null);
  const [loading, setLoading] = useState(true);

  const getStudent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAxiosInstance.get(endpoints.students.details(studentId));
      setStudent(response.data);
    } catch (error) {
      console.error('Failed to fetch student:', error);
      toast.error('Failed to fetch student details');
      router.push(paths.dashboard.students.list);
    } finally {
      setLoading(false);
    }
  }, [studentId, router]);

  useEffect(() => {
    getStudent();
  }, [getStudent]);

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

  if (!student) {
    return null;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Student"
        backHref={paths.dashboard.students.list}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Students', href: paths.dashboard.students.root },
          { name: student.firstName || 'Edit Student' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <StudentsNewEditForm currentStudent={student} />
    </DashboardContent>
  );
}
