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
import { StudentExamBookView } from 'src/sections/students/components/student-exam-booking-view';
import { StudentConsentFormView } from 'src/sections/students/components/student-consent-form-view';
import { StudentProgressView } from 'src/sections/students/components/student-progress-view';
import { StudentResumeView } from 'src/sections/students/components/student-resume-view';

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
  const [currentTab, setCurrentTab] = useState('resume');

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

  function InfoItem({ icon, label }: { icon?: string; label?: string | number | null }) {
    if (!label) return null;

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        {icon && <Iconify icon={icon} width={16} />}
        <span>{label}</span>
      </Stack>
    );
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
            href={`${paths.dashboard.students.root}/${student.id}/edit`}
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
          {student.coverPhoto ? (
            // If src exists, render the image
            <Box
              component="img"
              src={student.coverPhoto}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                objectFit: 'cover', // Ensures the image covers the area without distortion
              }}
            />
          ) : (
            // If src is missing, render a Box with the initial centered and larger
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                display: 'flex', // Enable flexbox
                justifyContent: 'center', // Center horizontally
                alignItems: 'center', // Center vertically
              }}
            >
              <Typography
                variant="h3" // Makes the text larger. You can adjust this variant.
                color="text.secondary" // Adjust color as needed, e.g., 'primary.main'
              >
                {student.firstName.substring(0, 1).toUpperCase()}{' '}
                {/* Convert to uppercase for consistency */}
              </Typography>
            </Box>
          )}

          <Stack spacing={1.5} flexGrow={1}>
            {/* Heading */}
            <Typography variant="h3">
              {student.firstName} {student.lastName}
            </Typography>
            {/* uni&courses details */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 3 }}
              sx={{ color: 'text.secoundry', typography: 'body1' }}
            >
              <InfoItem icon="eva:book-fill" label={student.universityName} />
              <InfoItem icon="eva:book-open-fill" label={student.courseName} />
              <InfoItem icon="eva:bookmark-fill" label={student.intakeName} />
            </Stack>
            {/* basic details */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 3 }}
              sx={{ color: 'text.secondary', typography: 'body2' }}
            >
              <InfoItem label={student.sex} />
              <InfoItem icon="eva:calendar-fill" label={student.dateOfBirth} />
              <InfoItem icon="eva:phone-fill" label={student.phoneNumber} />
              <InfoItem icon="eva:email-fill" label={student.email} />
              <InfoItem icon="healthicons:insurance-card" label={student.insuranceNumber} />
              <InfoItem
                icon="eva:pin-fill"
                label={[student.address, student.postCode].filter(Boolean).join(', ')}
              />
              <InfoItem icon="eva:map-fill" label={student.nationality} />
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
          <Tab label="Resume" value="resume" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {currentTab === 'documents' && (
            <StudentDocumentsView student={student} onRefresh={fetchStudent} />
          )}

          {currentTab === 'finance' && (
            <StudentFinanceView
              student={student}
              finance={student.finance?.status} // Default to 'Applied' if undefined
              onRefresh={fetchStudent}
            />
          )}

          {currentTab === 'booking' && (
            <StudentExamBookView
              student={student}
              booking={student.booking}
              onRefresh={fetchStudent}
            />
          )}

          {currentTab === 'progress' && (
            <StudentProgressView
              key={student.id}
              student={student}
              status={student.status as 'Enrolled' | 'Withdrawn' | 'Deferred'} // Pass the current status
              onRefresh={fetchStudent}
            />
          )}

          {currentTab === 'consent' && (
            <StudentConsentFormView student={student} onRefresh={fetchStudent} />
          )}
          {currentTab === 'resume' && (
            <StudentResumeView student={student} onRefresh={fetchStudent} />
          )}
        </Box>
      </Card>
    </DashboardContent>
  );
}
