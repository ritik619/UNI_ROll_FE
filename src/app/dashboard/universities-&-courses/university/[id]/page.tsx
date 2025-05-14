'use client';

import { useEffect, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Avatar from '@mui/material/Avatar';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { DashboardContent } from 'src/layouts/dashboard';
import { ICourse } from 'src/types/course';
import { IUniversity } from 'src/types/university';
import { UniversityCoursesView } from 'src/sections/universities/view/university-courses-view';

// ----------------------------------------------------------------------

type Props = {
  params: {
    id: string;
  };
};

export default function UniversityCoursesPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const [university, setUniversity] = useState<IUniversity | null>(null);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUniversity = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch university details
      const response = await authAxiosInstance.get(`${endpoints.universities.details(id)}`);
      setUniversity(response.data);
      
      // Fetch university courses
      const coursesResponse = await authAxiosInstance.get(`${endpoints.courses.list}`, {
        params: { 
          universityId: id,
          status: 'all', 
          page: 1, 
          limit: 100 
        }
      });
      
      setCourses(coursesResponse.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch university details:', error);
      toast.error('Failed to fetch university information');
      router.push(paths.dashboard.universitiesAndCourses.list);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchUniversity();
  }, [fetchUniversity]);

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

  if (!university) {
    return <></>;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`${university.name} Courses`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Universities & Courses', href: paths.dashboard.universitiesAndCourses.list },
          { name: university.name },
        ]}
        action={
          <Button
            component={RouterLink}
            href={`${paths.dashboard.universitiesAndCourses.addCourse}?universityId=${university.id}`}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add Course
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* University Info Card */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3}
          alignItems={{ sm: 'center' }}
        >
          <Avatar 
            alt={university.name} 
            src={university.logoUrl} 
            sx={{ 
              width: 80, 
              height: 80,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
              border: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {!university.logoUrl && (
              <Iconify icon="mdi:university" width={42} />
            )}
          </Avatar>
          
          <Stack spacing={1.5} flexGrow={1}>
            <Typography variant="h5">{university.name}</Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1, sm: 3 }}
              sx={{ color: 'text.secondary', typography: 'body2' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="eva:pin-fill" width={16} />
                <span>{university.cityName}, {university.countryName}</span>
              </Stack>
              
              {university.website && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="eva:globe-fill" width={16} />
                  <a href={university.website} target="_blank" rel="noopener" style={{ color: 'inherit' }}>
                    {university.website}
                  </a>
                </Stack>
              )}
            </Stack>
            
            {university.description && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {university.description}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Card>

      {/* Courses Section */}
      <UniversityCoursesView courses={courses} university={university} onCoursesChange={fetchUniversity} />
    </DashboardContent>
  );
}