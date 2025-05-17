'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AgentCardList } from '../agent-card-list';

// ----------------------------------------------------------------------

export function AgentCardsView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Agent cards"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Agent', href: paths.dashboard.agent.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.agent.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New agent
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AgentCardList agents={_userCards} />
    </DashboardContent>
  );
}
