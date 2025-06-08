'use client';

import { useEffect, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { DashboardContent } from 'src/layouts/dashboard';
import { IStudentsItem } from 'src/types/students';
import { StudentDocumentsView } from 'src/sections/students/components/student-documents-view';
import { StudentFinanceView } from 'src/sections/students/components/student-finance-view';
import { StudentBookingView } from 'src/sections/students/components/student-booking-view';
import { StudentConsentFormView } from 'src/sections/students/components/student-consent-form-view';
import { StudentProgressView } from 'src/sections/students/components/student-progress-view';

// ----------------------------------------------------------------------

type Props = {
  params: {
    id: string;
  };
};

export default function StudentDetailsPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const [student, setStudent] = useState<IStudentsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('documents');

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAxiosInstance.get(`${endpoints.students.details(id)}`);
      setStudent(response.data);
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      toast.error('Failed to fetch student information');
      router.push(paths.dashboard.students.list);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 3,
          textAlign: 'center',
          height: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!student) {
    return <></>;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`${student.firstName} ${student.lastName}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Students', href: paths.dashboard.students.list },
          { name: `${student.firstName} ${student.lastName}` },
        ]}
        action={
          <Button
            component={RouterLink}
            href={`${paths.dashboard.students.edit}/${student.id}`}
            variant="contained"
            startIcon={<Iconify icon="mingcute:edit-line" />}
          >
            Edit Student
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Student Info Card */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
          <Box
            component="img"
            alt={student.firstName}
            src={student.coverPhoto}
            sx={{
              width: 80,
              height: 80,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
              border: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          />

          <Stack spacing={1.5} flexGrow={1}>
            <Typography variant="h5">
              {student.firstName} {student.lastName}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 3 }}
              sx={{ color: 'text.secondary', typography: 'body2' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="eva:email-fill" width={16} />
                <span>{student.email}</span>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="eva:phone-fill" width={16} />
                <span>{student.phoneNumber}</span>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="eva:pin-fill" width={16} />
                <span>
                  {student.address}, {student.postCode}
                </span>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      {/* Tabs Section */}
      <Card sx={{ p: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            px: 2,
            bgcolor: 'background.neutral',
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Tab label="Documents" value="documents" />
          <Tab label="Finance" value="finance" />
          <Tab label="Booking" value="booking" />
          <Tab label="Progress" value="progress" />
          <Tab label="Consent Form" value="consent" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {currentTab === 'documents' && (
            <StudentDocumentsView student={student} onRefresh={fetchStudent} />
          )}

          {currentTab === 'finance' && (
            <StudentFinanceView student={student} onRefresh={fetchStudent} />
          )}

          {currentTab === 'booking' && (
            <StudentBookingView student={student} onRefresh={fetchStudent} />
          )}

          {currentTab === 'progress' && (
            <StudentProgressView student={student} onRefresh={fetchStudent} />
          )}

          {currentTab === 'consent' && (
            <StudentConsentFormView student={student} onRefresh={fetchStudent} />
          )}
        </Box>
      </Card>
    </DashboardContent>
  );
}
