'use client';

// ----------------------------------------------------------------------

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UniversityNewEditForm } from './university-new-edit-form';


export default function UniversityCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new University"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'University', href: paths.dashboard.universitiesAndCourses.root },
          { name: 'New University' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UniversityNewEditForm />
    </DashboardContent>
  );
}
