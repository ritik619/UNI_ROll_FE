'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StudentsCardList } from '../students-card-list';

// ----------------------------------------------------------------------

export function StudentsCardsView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Students cards"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Students', href: paths.dashboard.students.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.students.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Student
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <StudentsCardList user={_userCards} />
    </DashboardContent>
  );
}
