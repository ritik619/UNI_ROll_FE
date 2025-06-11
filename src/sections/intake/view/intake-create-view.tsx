'use client';

// ----------------------------------------------------------------------

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { IntakeNewEditForm } from './intake-new-edit-form';

export default function IntakeCreateView() {
  const searchParams = useSearchParams();
  const universityId = searchParams.get('universityId') || '';

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new Intakes"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Intakes', href: paths.dashboard.intakes.list },
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <IntakeNewEditForm />
    </DashboardContent>
  );
}
