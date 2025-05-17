'use client';

import type { IStudentsItem } from 'src/types/students';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StudentsNewEditForm } from '../students-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  students?: IStudentsItem;
};

export function StudentsEditView({ students: currentStudents }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.students.list}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Students', href: paths.dashboard.students.root },
          { name: currentStudents?.firstName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <StudentsNewEditForm currentStudents={currentStudents} />
    </DashboardContent>
  );
}
