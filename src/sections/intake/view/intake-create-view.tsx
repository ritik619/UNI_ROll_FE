'use client';

// ----------------------------------------------------------------------

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { IntakeNewEditForm } from './intake-new-edit-form';

export default function CourseCreateView() {
  const searchParams = useSearchParams();
  const universityId = searchParams.get('universityId') || '';

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new Course"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Courses', href: paths.dashboard.universitiesAndCourses.list },
          { name: 'New Course' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <IntakeNewEditForm />
    </DashboardContent>
  );
}