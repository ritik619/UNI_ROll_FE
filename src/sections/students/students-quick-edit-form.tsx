import type { IStudentsItem } from 'src/types/students';

import { z as zod } from 'zod';
import router from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Card, Grid2, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { fData } from 'src/utils/format-number';

import { STUDENTS_STATUS_OPTIONS, USER_STATUS_OPTIONS } from 'src/_mock';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type StudentsQuickEditSchemaType = zod.infer<typeof StudentsQuickEditSchema>;

export const StudentsQuickEditSchema = zod.object({
  avatarUrl: schemaHelper.file().nullable().optional(),
  firstName: zod.string().min(1, { message: 'First Name is required!' }),
  lastName: zod.string().min(1, { message: 'Last Name is required!' }),
  dateOfBirth: zod.string().min(1, { message: 'Date of Birth is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  university: zod.string().min(1, { message: 'University Name is required!' }),
  // accountNumber: zod
  //   .string()
  //   .min(1, { message: 'Account Number is required!' })
  //   .regex(/^\d{8}$/, { message: 'Account number should be 10 digits' }),
  // sortCode: zod
  //   .string()
  //   .min(1, { message: 'Sort code is required!' })
  //   .regex(/^\d{2}-\d{2}-\d{2}$/, {
  //     message: 'Sort code should be in the format XX-XX-XX',
  //   })
  // .refine((val) => val.replace(/\D/g, '').length === 6, {
  //   message: 'Sort code must be exactly 6 digits!',
  // }),
  courses: zod.string().min(1, { message: 'Courses is required!' }),
  emergencyName: zod.string().optional(),
  emergencyNumber: zod.string().optional(),
  emergencyAddress: zod.string().optional(),
  emergencyEmail: zod.string().email('Invalid email').optional(),
  // password: zod.string().min(8, { message: 'Password must be at least 8 characters long!' }),
  status: zod.string(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentStudents?: IStudentsItem;
};

export function StudentsQuickEditForm({ currentStudents, open, onClose }: Props) {
  const defaultValues: StudentsQuickEditSchemaType = {
    status: '',
    avatarUrl: null,
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date().toString(),
    address: '',
    university: '',
    courses: '',
    emergencyName: '',
    emergencyNumber: '',
    emergencyAddress: '',
    emergencyEmail: '',
  };

  const methods = useForm<StudentsQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(StudentsQuickEditSchema),
    defaultValues,
    values: {
      ...defaultValues,
      ...currentStudents,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const updateAgent = async (data: StudentsQuickEditSchemaType) => {
    const payload = {
      // avatarUrl: data.avatarUrl ?? null,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dateOfBirth: data.dateOfBirth,
      email: data.email.trim().toLowerCase(),
      address: data.address.trim(),
      university: data.university.trim(),
      emergencyName: data.emergencyName?.trim(),
      emergencyNumber: data.emergencyNumber?.trim(),
      emergencyAddress: data.emergencyAddress?.trim(),
      emergencyEmail: data.emergencyEmail?.trim(),
      // bankDetails: {
      //   accountNumber: data.accountNumber.trim(),
      //   sortCode: data.sortCode.trim(),
      // },
      courses: data.courses.trim(),
      status: data.status,
    };

    const uId = currentStudents?.id || '';
    const response = await authAxiosInstance.patch<{ id: string }>(
      endpoints.agents.details(uId),
      payload
    );
    // Then handle profile photo upload if available
    if (data.avatarUrl && data.avatarUrl instanceof File) {
      // Create FormData to match the FileInterceptor on the backend
      const formData = new FormData();
      formData.append('file', data.avatarUrl);
      // Send the profile photo to the correct endpoint
      await authAxiosInstance.post(endpoints.agents.profilePhoto(uId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // return [response.data];
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateAgent(data);
      toast.success(currentStudents ? 'Update success!' : 'Update error!');
      router.push(paths.dashboard.agent.list);
    } catch (error: any) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 720 } }}
    >
      <DialogTitle>Quick update</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          {currentStudents?.status === 'UnEnrolled' && (
            <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
              Account is waiting for confirmation
            </Alert>
          )}
          {/* <Box sx={{ mb: 5 }}>
            <Field.UploadAvatar
              name="avatarUrl"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Box> */}
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Field.Select name="status" label="Status" sx={{ gridColumn: 'span 2' }}>
              {STUDENTS_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Field.Select>
            <Field.Text name="firstName" label="First Name" />
            <Field.Text name="lastName" label="Last Name" />
            <Field.DatePicker name="dateOfBirth" label="Date of Birth" />
            <Field.Text name="email" label="Email Address" />
            <Field.Text name="university" label="University" />
            <Field.Text name="courses" label="Courses" />
            <Field.Text name="address" label="Address" sx={{ gridColumn: 'span 2' }} />
            <Field.Text name="emergencyName" label="Emergency Name" />
            <Field.Text name="emergencyNumber" label="Emergency Number" />
            <Field.Text name="emergencyAddress" label="Emergency Address" />
            <Field.Text name="emergencyEmail" label="Emergency Email" />
            {/*
            <Grid2 size={{ xs: 12 }} spacing={2} sx={{ gridColumn: 'span 2' }}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#919eab' }}>
                  Bank Details
                </Typography>
                <Box
                  sx={{
                    rowGap: 3,
                    columnGap: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  <Field.Text name="accountNumber" label="Account Number" />
                  <Field.Text name="sortCode" label="Sort Code" />
                </Box>
              </Card>
            </Grid2> */}

            {/* <Field.Text name="password" label="Password" sx={{ gridColumn: 'span 2' }} /> */}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
