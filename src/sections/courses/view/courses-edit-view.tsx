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
import { BasicBackButton, CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CourseNewEditForm } from './course-new-edit-form';

import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { ICourse } from 'src/types/course';
import { DashboardContent } from 'src/layouts/dashboard';

// Mock data - will use real API in production
const MOCK_COURSES: { [key: string]: ICourse } = {
  'course-1': {
    id: 'course-1',
    name: 'Bachelor of Computer Science',
    code: 'CS-BSC-01',
    universityId: 'uni-1',
    universityName: 'Oxford University',
    description:
      'A comprehensive program covering fundamentals of computer science, algorithms, and software development.',
    durationMonths: 36, // 3 years * 12 months
    tuitionFee: 9250,
    startDates: ['2023-09-01', '2024-01-15'],
    status: 'active',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-03-20'),
  },
  'course-2': {
    id: 'course-2',
    name: 'Master of Data Science',
    code: 'CS-MDS-01',
    universityId: 'uni-1',
    universityName: 'Oxford University',
    description:
      'Advanced program focusing on statistical analysis, machine learning, and big data technologies.',
    durationMonths: 18, // 1.5 years = 18 months
    tuitionFee: 12500,
    startDates: ['2023-09-15', '2024-02-01'],
    status: 'active',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-04-05'),
  },
  'course-3': {
    id: 'course-3',
    name: 'Bachelor of Business Administration',
    code: 'BUS-BBA-01',
    universityId: 'uni-2',
    universityName: 'Cambridge University',
    description:
      'A program designed to develop skills in business management, finance, and marketing.',
    durationMonths: 36, // 3 years * 12 months
    tuitionFee: 8750,
    startDates: ['2023-09-01'],
    status: 'active',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-03-15'),
  },
};

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
      router.push(paths.dashboard.universitiesAndCourses.list);
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
