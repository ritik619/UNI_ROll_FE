'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AgentNewEditForm } from '../agent-new-edit-form';

// ----------------------------------------------------------------------

export function AgentCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new agent"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Agent', href: paths.dashboard.agent.root },
          { name: 'New Agent' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AgentNewEditForm />
    </DashboardContent>
  );
}
