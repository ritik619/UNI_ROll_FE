'use client';

import type { IAgentItem } from 'src/types/agent';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AgentNewEditForm } from '../agent-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  agent?: IAgentItem;
};

export function AgentEditView({ agent: currentAgent }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.agent.list}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Agent', href: paths.dashboard.agent.root },
          { name: currentAgent?.firstName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AgentNewEditForm currentAgent={currentAgent} />
    </DashboardContent>
  );
}
