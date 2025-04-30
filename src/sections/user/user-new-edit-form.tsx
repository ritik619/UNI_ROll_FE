import type { IUserItem } from 'src/types/user';

import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { formatDateToDDMMYYYY } from 'src/utils/format-date';

// ----------------------------------------------------------------------

export const NewUserSchema = zod.object({
  fName: zod.string().min(1, { message: 'First Name is required!' }),
  lName: zod.string().min(1, { message: 'Last Name is required!' }),
  dob: zod.string().min(1, { message: 'Date of Birth is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  postCode: zod.string().min(1, { message: 'Post code is required!' }),
  accountNumber: zod.string().min(1, { message: 'Account Number is required!' }),
  sortCode: zod.string().min(1, { message: 'Sort code is required!' }),
  utrNumber: zod.string().regex(/^\d{10}$/, { message: 'UTR number should be 10 digits' }),
  password: zod.string().min(8, { message: 'Password must be at least 8 characters long!' }),
  status: zod.enum(['active', 'inactive']).optional(),
});

export type NewUserSchemaType = zod.infer<typeof NewUserSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
};

export function UserNewEditForm({ currentUser }: Props) {
  const router = useRouter();
  const auth = useAuthContext();
  const authToken = auth.user?.accessToken;

  const defaultValues: NewUserSchemaType = {
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

  const methods = useForm<NewUserSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
    defaultValues,
    values: currentUser,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const createAgent = async (data: NewUserSchemaType) => {
    const apiUrl = 'https://us-central1-uni-enroll-e95e7.cloudfunctions.net/api/agents';

    const payload = {
      firstName: data.fName.trim(),
      lastName: data.lName.trim(),
      dateOfBirth: formatDateToDDMMYYYY(data.dob),
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

    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.post<{ id: string }>(apiUrl, payload, config);
    return response.data;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createAgent(data);
      toast.success(currentUser ? 'Update success!' : 'Create success!');
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
                {!currentUser ? 'Create user' : 'Save changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
