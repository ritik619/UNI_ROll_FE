'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StudentsNewEditForm } from '../students-new-edit-form';

// ----------------------------------------------------------------------

export function StudentsCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new Student"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Students', href: paths.dashboard.students.root },
          { name: 'New Student' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <StudentsNewEditForm />
    </DashboardContent>
  );
}
