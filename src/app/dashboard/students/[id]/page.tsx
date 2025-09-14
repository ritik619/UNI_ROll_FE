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
// import { StudentConsentFormView } from 'src/sections/students/components/student-consent-form-view';
import { StudentProgressView } from 'src/sections/students/components/student-progress-view';
import { StudentResumeView } from 'src/sections/students/components/student-resume-view';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material';
import { StudentPersonalStatementView } from 'src/sections/students/components/student-personal-statement-view';
import { toDMY } from 'src/utils/format-date';

// ----------------------------------------------------------------------

type Props = {
  params: {
    id: string;
  };
};

export default function StudentDetailsPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const theme = useTheme();
  const [student, setStudent] = useState<IStudentsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('documents');
  const [university, setUniversity] = useState({});

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAxiosInstance.get(`${endpoints.students.details(id)}`);
      if (response?.data?.universityId) {
        const { data } = await authAxiosInstance.get(
          endpoints.universities.details(response.data.universityId)
        );
        setUniversity(data);
      }
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

  const avatarSize = {
    width: { xs: theme.spacing(7.5), sm: theme.spacing(10) },
    height: { xs: theme.spacing(7.5), sm: theme.spacing(10) },
  };

  function InfoItem({ icon, label }: { icon?: string; label?: string | number | null }) {
    if (!label) return null;

    return (
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        {icon && <Iconify icon={icon} width={16} />}
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {label}
        </Typography>
      </Stack>
    );
  }
  function parseDate(str) {
    const [month, day, year] = str.split('/').map(Number);
    return `${day}/${month}/${year}`;
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          {/* {student.coverPhoto ? (
            <Box
              component="img"
              src={student.coverPhoto}
              sx={{
                ...avatarSize,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                ...avatarSize,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} color="text.secondary">
                {student.firstName.substring(0, 1).toUpperCase()}
              </Typography>
            </Box>
          )} */}

          <Stack spacing={1.5} flexGrow={1}>
            {/* Heading */}
            <Typography variant="h3">
              {student.firstName} {student.lastName}
            </Typography>
            <Typography variant="h5">Agent: {student.agentName}</Typography>
            {/* University & Course Details */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 3 }}
              sx={{ color: 'text.secondary', typography: 'body1' }}
            >
              {student.leadNumber && (
                <InfoItem icon="healthicons:insurance-card" label={student.leadNumber} />
              )}
              {student.courseName && (
                <InfoItem icon="eva:book-open-fill" label={student.courseName} />
              )}
              {student.universityName && (
                <InfoItem icon="eva:book-fill" label={student.universityName} />
              )}
              {student?.intakeName && (
                <InfoItem icon="eva:bookmark-fill" label={student?.intakeName ?? ''} />
              )}
              {university?.cityName && university?.countryName && (
                <InfoItem
                  icon="eva:globe-outline"
                  label={[university?.cityName ?? '', university?.countryName ?? '']
                    .filter(Boolean)
                    .join(', ')}
                />
              )}
            </Stack>
            {/* Basic Details */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 3 }}
              sx={{ color: 'text.secondary', typography: 'body2' }}
            >
              {student.sex && (
                <InfoItem
                  icon={
                    student.sex.toLowerCase() === 'male'
                      ? 'picon:male'
                      : student.sex.toLowerCase() === 'female'
                        ? 'picon:female'
                        : 'fa6-solid:transgender'
                  }
                  label={student.sex}
                />
              )}
              {student.dateOfBirth && (
                <InfoItem icon="eva:calendar-fill" label={parseDate(student.dateOfBirth)} />
              )}
              {student.phoneNumber && (
                <InfoItem icon="eva:phone-fill" label={student.phoneNumber} />
              )}
              {student.email && <InfoItem icon="eva:email-fill" label={student.email} />}

              {student.address && (
                <InfoItem
                  icon="eva:pin-fill"
                  label={[student.address, student.postCode && student.postCode]
                    .filter(Boolean)
                    .join(', ')}
                />
              )}
              {student.nationality && <InfoItem icon="eva:map-fill" label={student.nationality} />}
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 3 }}
              sx={{ color: 'text.secondary', typography: 'body2' }}
            >
              {student.insuranceNumber && (
                <InfoItem icon="healthicons:insurance-card" label={student.insuranceNumber} />
              )}
              {student.emergencyName && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    color: 'text.secondary',
                    typography: 'body2',
                    border: '1px solid',
                    borderColor: '#FF5630',
                    borderRadius: 1,
                    px: 0.5,
                    py: 0.25,
                    maxWidth: 'fit-content',
                    columnGap: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  <Label sx={{ background: '#FF5630' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Iconify
                        icon="eva:heart-fill"
                        color={theme.palette.background.default}
                        width={18}
                      />
                      <span
                        style={{
                          color: theme.palette.background.paper,
                          fontWeight: 'bold',
                          fontSize: '16px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Emergency
                      </span>
                    </Box>
                  </Label>

                  {student.emergencyName && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Iconify icon="eva:person-fill" color="#FF5630" width={16} />
                      <span>{student.emergencyName}</span>
                    </Box>
                  )}

                  {student.emergencyNumber && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Iconify icon="eva:phone-fill" color="#FF5630" width={16} />
                      <span>{student.emergencyNumber}</span>
                    </Box>
                  )}
                  {student.emergencyAddress && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Iconify icon="eva:pin-fill" color="#FF5630" width={16} />
                      <span>{student.emergencyAddress}</span>
                    </Box>
                  )}
                  {student.emergencyEmail && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Iconify icon="eva:email-fill" color="#FF5630" width={16} />
                      <span>{student.emergencyEmail}</span>
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
            {student?.agentName && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 3 }}
                sx={{ color: 'text.secondary', typography: 'body2' }}
              >
                AgentName:
                <InfoItem icon="healthicons:insurance-card" label={student?.agentName || 'NA'} />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ p: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
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
          <Tab label="CV" value="resume" />
          <Tab label="Personal Statement" value="personalStatement" />
          {/* <Tab label="Consent Form" value="consent" /> */}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {currentTab === 'documents' && (
            <StudentDocumentsView student={student} onRefresh={fetchStudent} />
          )}
          {currentTab === 'finance' && (
            <StudentFinanceView
              student={student}
              finance={student.finance?.status ?? 'Applied'}
              onRefresh={fetchStudent}
            />
          )}
          {currentTab === 'booking' && (
            <StudentExamBookView
              student={student}
              booking={student.booking ?? {}}
              onRefresh={fetchStudent}
            />
          )}
          {currentTab === 'progress' && (
            <StudentProgressView
              key={student.id}
              student={student}
              status={student.status as 'Enrolled' | 'Withdrawn' | 'Deferred'}
              onRefresh={fetchStudent}
            />
          )}
          {currentTab === 'resume' && (
            <StudentResumeView student={student} onRefresh={fetchStudent} />
          )}
          {currentTab === 'personalStatement' && (
            <StudentPersonalStatementView
              key={student.id}
              student={student}
              onRefresh={fetchStudent}
            />
          )}
          {/* {currentTab === 'consent' && (
            <StudentConsentFormView student={student} onRefresh={fetchStudent} />
          )} */}
        </Box>
      </Card>
    </DashboardContent>
  );
}
