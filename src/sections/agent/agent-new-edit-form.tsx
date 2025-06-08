import type { IAgentItem } from 'src/types/agent';

import { z as zod } from 'zod';
import { Controller, useForm } from 'react-hook-form';
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
import { Switch } from '@mui/material';

// ----------------------------------------------------------------------

export const NewAgentSchema = zod.object({
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
    .regex(/^\d{10}$/, { message: 'Account number should be 10 digits' }),
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
  unc: zod.boolean(),
  intake: zod.boolean(),
});

export type NewAgentSchemaType = zod.infer<typeof NewAgentSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentAgent?: IAgentItem;
};

export function AgentNewEditForm({ currentAgent }: Props) {
  const router = useRouter();

  const defaultValues: NewAgentSchemaType = {
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
    unc: false,
    intake: false,
  };

  const methods = useForm<NewAgentSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewAgentSchema),
    defaultValues,
    values: currentAgent,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const createAgent = async (data: NewAgentSchemaType) => {
    const payload = {
      firstName: data.fName.trim(),
      lastName: data.lName.trim(),
      dateOfBirth: new Date(data.dob),
      email: data.email.trim().toLowerCase(),
      address: data.address.trim(),
      postCode: data.postCode.trim(),
      bankDetails: {
        accountNumber: data.accountNumber.trim(),
        sortCode: data.sortCode.trim(),
      },
      utrNumber: data.utrNumber.trim(),
      password: data.password.trim(),
      status: 'active',
      // accessControl: {
      //   unc: data.unc,
      //   intake: data.intake,
      // },
    };

    const response = await authAxiosInstance.post<{ id: string }>(endpoints.agents.list, payload);
    return response;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createAgent(data);
      toast.success(currentAgent ? 'Update success!' : 'Create success!');
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
                    <Field.Text
                      name="sortCode"
                      label="Sort Code"
                      helperText="Format: XX-XX-XX (e.g., 12-34-56)"
                    />
                    <Field.Text
                      name="accountNumber"
                      label="Account Number"
                      helperText="Must be 10 digits (e.g., 1234567890)"
                    />
                  </Box>
                </Card>
              </Grid>

              <Field.Text
                name="utrNumber"
                label="UTR Number"
                helperText="Must be 10 digits (e.g., 1234567890)"
                sx={{ gridColumn: 'span 2' }}
              />
              <Field.Text name="password" label="Password" sx={{ gridColumn: 'span 2' }} />
            </Box>
            {/* Access Control */}
            {/* <Card
              sx={{
                padding: '20px',
                marginY: '10px',
                // width: '40vw',
                display: 'flex',
                alignItems: 'flex-start',
                alignContent: 'center',
                justifyContent: 'space-between',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#919eab' }}>
                Access Control
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  alignContent: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  width: '-webkit-fill-available',
                }}
              >
                <Card
                  sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    width: '50%',

                    padding: '10px',
                    margin: '5px',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#919eab' }}>
                    Universities & Courses
                  </Typography>
                  <Controller
                    name="unc"
                    control={methods.control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </Card>

                <Card
                  sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    width: '50%',
                    padding: '10px',
                    margin: '5px',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#919eab' }}>
                    Earnings Overview
                  </Typography>
                  <Controller
                    name="intake"
                    control={methods.control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />{' '}
                </Card>
              </Box>
            </Card> */}
            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentAgent ? 'Create agent' : 'Save changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
