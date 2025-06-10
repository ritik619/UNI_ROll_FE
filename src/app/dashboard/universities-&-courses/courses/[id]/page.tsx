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
import { CoursesView } from 'src/sections/courses/view/courses-view';

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
  const [course, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    // setLoading(true);
    // try {
    //   // Fetch course details
    //   const response = await authAxiosInstance.get(`${endpoints.courses.details(id)}`);
    //   setCourses(response.data);
    //   // Fetch course course
    //   const courseResponse = await authAxiosInstance.get(`${endpoints.courses.list}`, {
    //     params: {
    //       courseId: id,
    //       status: 'all',
    //       page: 1,
    //       limit: 100,
    //     },
    //   });
    //   setCourses(courseResponse.data.course || []);
    // } catch (error) {
    //   console.error('Failed to fetch course details:', error);
    //   toast.error('Failed to fetch course information');
    //   router.push(paths.dashboard.universitiesAndCourses.listUniversities);
    // } finally {
    //   setLoading(false);
    // }
  }, [id, router]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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

  // return (
  //   <DashboardContent>
  //     <CustomBreadcrumbs
  //       heading={`${course.name} Course`}
  //       links={[
  //         { name: 'Dashboard', href: paths.dashboard.root },
  //         { name: 'Universities & Courses', href: paths.dashboard.universitiesAndCourses.listUniversities },
  //         { name: course.name },
  //       ]}
  //       action={
  //         <Button
  //           component={RouterLink}
  //           href={`${paths.dashboard.universitiesAndCourses.addCourse}?courseId=${course.id}`}
  //           variant="contained"
  //           startIcon={<Iconify icon="mingcute:add-line" />}
  //         >
  //           Add Course
  //         </Button>
  //       }
  //       sx={{ mb: { xs: 3, md: 5 } }}
  //     />

  //     {/* Courses Info Card */}
  //     <Card sx={{ p: 3, mb: 4 }}>
  //       <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
  //         <Avatar
  //           alt={course.name}
  //           src={course.logoUrl}
  //           sx={{
  //             width: 80,
  //             height: 80,
  //             borderRadius: 1.5,
  //             bgcolor: 'background.neutral',
  //             border: (theme) => `solid 1px ${theme.palette.divider}`,
  //           }}
  //         >
  //           {!course.logoUrl && <Iconify icon="mdi:course" width={42} />}
  //         </Avatar>

  //         <Stack spacing={1.5} flexGrow={1}>
  //           <Typography variant="h5">{course.name}</Typography>

  //           <Stack
  //             direction={{ xs: 'column', sm: 'row' }}
  //             spacing={{ xs: 1, sm: 3 }}
  //             sx={{ color: 'text.secondary', typography: 'body2' }}
  //           >
  //             <Stack direction="row" spacing={1} alignItems="center">
  //               <Iconify icon="eva:pin-fill" width={16} />
  //               <span>
  //                 {course.cityName}, {course.countryName}
  //               </span>
  //             </Stack>

  //             {course.website && (
  //               <Stack direction="row" spacing={1} alignItems="center">
  //                 <Iconify icon="eva:globe-fill" width={16} />
  //                 <a
  //                   href={course.website}
  //                   target="_blank"
  //                   rel="noopener"
  //                   style={{ color: 'inherit' }}
  //                 >
  //                   {course.website}
  //                 </a>
  //               </Stack>
  //             )}
  //           </Stack>

  //           {course.description && (
  //             <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
  //               {course.description}
  //             </Typography>
  //           )}
  //         </Stack>
  //       </Stack>
  //     </Card>

  //     {/* Courses Section */}
  //     <CoursesView courses={course} onCoursesChange={fetchCourses} />
  //   </DashboardContent>
  // );
}
