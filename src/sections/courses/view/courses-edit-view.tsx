'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CourseNewEditForm } from './course-new-edit-form';

import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { ICourse } from 'src/types/course';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

type Props = {
  courseId: string;
};

export default function CourseEditView({ courseId }: Props) {
  const router = useRouter();
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);

  const getCourse = useCallback(async () => {
    setLoading(true);
    try {
      // For production, this would be a real API call:
      const response = await authAxiosInstance.get(`${endpoints.courses.details(courseId)}`);
      console.log('Course response:', response.data);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('Failed to fetch course details');
      router.push(paths.dashboard.universitiesAndCourses.listCourses);
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    getCourse();
  }, [getCourse]);

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

  if (!course) {
    return <></>;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Course"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Courses', href: paths.dashboard.universitiesAndCourses.list },
          { name: 'Edit Course' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CourseNewEditForm currentCourse={course} />
    </DashboardContent>
  );
}
