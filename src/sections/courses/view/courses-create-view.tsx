'use client';

// ----------------------------------------------------------------------

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CourseNewEditForm } from './course-new-edit-form';


export default function CourseCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new Course"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Courses', href: paths.dashboard.universitiesAndCourses.root },
          { name: 'New Course' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CourseNewEditForm />
    </DashboardContent>
  );
}