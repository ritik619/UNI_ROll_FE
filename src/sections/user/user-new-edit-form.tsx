import type { IUserItem } from 'src/types/user';

import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type NewUserSchemaType = zod.infer<typeof NewUserSchema>;

export const NewUserSchema = zod.object({
  avatarUrl: schemaHelper.file({ message: 'Avatar is required!' }),
  fName: zod.string().min(1, { message: 'First Name is required!' }),
  lName: zod.string().min(1, { message: 'Last Name is required!' }),

  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  accountNummber: zod.string().min(1, { message: 'Account Nummber is required!' }),
  utrNumber: zod.string().min(1, { message: 'Company is required!' }),
  password: zod.string().min(1, { message: 'Password is required!' }),
  sortCode: zod.string().min(1, { message: 'Zip code is required!' }),
  // Not required
  status: zod.string(),
  isVerified: zod.boolean(),
});

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
};

export function UserNewEditForm({ currentUser }: Props) {
  const router = useRouter();

  const defaultValues: NewUserSchemaType = {
    status: '',
    avatarUrl: null,
    isVerified: true,
    fName: '',
    lName: '',
    email: '',
    phoneNumber: '',
    accountNummber: '',
    address: '',
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
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.agent.list);
      console.info('DATA', data);
    } catch (error) {
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

              <Field.Text name="dob" label="Date of Birth" placeholder="dd/mm/yyyy" />
              <Field.Text name="email" label="Email Address" />

              <Field.Text name="address" label="Address" fullWidth sx={{ gridColumn: 'span 2' }} />

              <Grid size={{ xs: 24 }} spacing={2}>
                <Card sx={{ p: 2, m: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#919eab' }}>
                    Bank Details
                  </Typography>
                  <Field.Text name="sortCode" label="Sort Code" />
                  <Field.Text name="accountNumber" label="Account Number" />
                </Card>
              </Grid>

              <Field.Text
                name="utrNumber"
                label="UTR Number"
                fullWidth
                sx={{ gridColumn: 'span 2' }}
              />
              <Field.Text
                name="password"
                label="Password"
                fullWidth
                sx={{ gridColumn: 'span 2' }}
              />
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
