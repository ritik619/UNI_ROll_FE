'use client';

import type { IUserItem } from 'src/types/agent';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { formatDateToDDMMYYYY } from 'src/utils/format-date';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export const NewUniversitySchema = zod.object({
  fName: zod.string().min(1, { message: 'First Name is required!' }),
  lName: zod.string().min(1, { message: 'Last Name is required!' }),
  dob: zod.string().min(1, { message: 'Date of Birth is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  postCode: zod.string().min(1, { message: 'Post code is required!' }),
  accountNumber: zod
    .string()
    .min(1, { message: 'Account Number is required!' })
    .regex(/^\d{8}$/, { message: 'Account number should be 10 digits' }),
  sortCode: zod
    .string()
    .min(1, { message: 'Sort code is required!' })
    .regex(/^\d{2}-\d{2}-\d{2}$/, {
      message: 'Sort code should be in the format XX-XX-XX',
    })
    .refine((val) => val.replace(/\D/g, '').length === 6, {
      message: 'Sort code must be exactly 6 digits!',
    }),
  utrNumber: zod.string().regex(/^\d{10}$/, { message: 'UTR number should be 10 digits' }),
  password: zod.string().min(8, { message: 'Password must be at least 8 characters long!' }),
  status: zod.enum(['active', 'inactive']).optional(),
});

export type NewUniversitySchemaType = zod.infer<typeof NewUniversitySchema>;

// ----------------------------------------------------------------------

type Props = {
  currentUniversity?: IUserItem;
};

export function UniversityNewEditForm({ currentUniversity }: Props) {
  const router = useRouter();
  const auth = useAuthContext();
  const authToken = auth.user?.accessToken;

  const defaultValues: NewUniversitySchemaType = {
    fName: '',
    lName: '',
    email: '',
    dob: '',
    accountNumber: '',
    address: '',
    postCode: '',
    sortCode: '',
    utrNumber: '',
    password: '',
  };

  const methods = useForm<NewUniversitySchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewUniversitySchema),
    defaultValues,
    values: currentUniversity,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const createAgent = async (data: NewUniversitySchemaType) => {
    const payload = {
      firstName: data.fName.trim(),
      lastName: data.lName.trim(),
      dateOfBirth: formatDateToDDMMYYYY(new Date(data.dob)),
      email: data.email.trim(),
      address: data.address.trim(),
      postCode: data.postCode.trim(),
      bankDetails: {
        accountNumber: data.accountNumber.trim(),
        sortCode: data.sortCode.trim(),
      },
      utrNumber: data.utrNumber.trim(),
      password: data.password.trim(),
      status: 'active',
    };

    const response = await authAxiosInstance.post<{ id: string }>(endpoints.agents.list, payload);
    return response;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createAgent(data);
      toast.success(currentUniversity ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.agent.list);
    } catch (error: any) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="fName" label="First Name" />
              <Field.Text name="lName" label="Last Name" />
              <Field.DatePicker name="dob" label="Date of Birth" />
              <Field.Text name="email" label="Email Address" />
              <Field.Text name="address" label="Address" />
              <Field.Text name="postCode" label="Post Code" />

              <Grid size={{ xs: 24 }} spacing={4}>
                <Card sx={{ p: 1 }}>
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
                    <Field.Text name="sortCode" label="Sort Code" />
                    <Field.Text name="accountNumber" label="Account Number" />
                  </Box>
                </Card>
              </Grid>

              <Field.Text name="utrNumber" label="UTR Number" sx={{ gridColumn: 'span 2' }} />
              <Field.Text name="password" label="Password" sx={{ gridColumn: 'span 2' }} />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUniversity ? 'Create user' : 'Save changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
