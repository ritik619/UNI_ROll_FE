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

export type NewAgentSchemaType = zod.infer<typeof NewAgentSchema>;

export const NewAgentSchema = zod.object({
  firstName: zod
    .string()
    .min(1, { message: 'First Name is required!' })
    .transform((str) => str.trim()),
  lastName: zod
    .string()
    .min(1, { message: 'Last Name is required!' })
    .transform((str) => str.trim()),
  dateOfBirth: zod.string().min(1, { message: 'Date of Birth is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  postCode: zod.string().min(1, { message: 'Post code is required!' }),
  accountNumber: zod.string().min(1, { message: 'Account number is required' }),
  sortCode: zod.string().min(1, { message: 'Sort code is required!' }),
  utrNumber: zod.string().min(1, { message: 'UTR number is required' }),
  password: zod.string().min(8, { message: 'Password must be at least 8 characters long!' }),
  status: zod.enum(['active', 'inactive']).optional(),
  showUniversities: zod.boolean(),
  showIntakes: zod.boolean(),
  isReferral: zod.boolean(),
});

// ----------------------------------------------------------------------

type Props = {
  // currentAgent?: IAgentItem;
};

export function AgentNewEditForm(
  {
    // currentAgent
  }: Props
) {
  const router = useRouter();

  const defaultValues: NewAgentSchemaType = {
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date().toISOString().substring(0, 10), // "YYYY-MM-DD"
    accountNumber: '',
    address: '',
    postCode: '',
    sortCode: '',
    utrNumber: '',
    password: '',
    showUniversities: false,
    showIntakes: false,
    isReferral: false,
  };

  const methods = useForm<NewAgentSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewAgentSchema),
    defaultValues,
    // values: currentAgent,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const createAgent = async (data: NewAgentSchemaType) => {
    const payload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dateOfBirth: new Date(data.dateOfBirth),
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
      showUniversities: data.showUniversities,
      showIntakes: data.showIntakes,
      isReferral: data.isReferral,
    };

    const response = await authAxiosInstance.post<{ id: string }>(endpoints.agents.list, payload);
    return response;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createAgent(data);
      toast.success(
        // currentAgent ? 'Update success!' :
        'Create success!'
      );
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
              <Field.Text name="firstName" label="First Name" />
              <Field.Text name="lastName" label="Last Name" />
              <Field.DatePicker name="dateOfBirth" label="Date of Birth" />
              <Field.Text name="email" label="Email Address" />
              <Field.Text name="address" label="Address" />
              <Field.Text name="postCode" label="Post Code" />
              <Field.Text name="password" label="Password" sx={{ gridColumn: 'span 1' }} />
              {/* Referral Agent */}
              <Card
                sx={{
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  borderRadius: "8px"
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#919eab' }}>
                  Referral Agent
                </Typography>
                <Controller
                  name="isReferral"
                  control={methods.control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </Card>
              {/* Bank Details */}
              <Card
                sx={{
                  padding: '20px',
                  marginY: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  alignContent: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'column',
                  rowGap: 3,
                  columnGap: 2,
                  gridColumn: 'span 2',
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#919eab', m: 1 }}>
                  Bank Details
                </Typography>
                <Grid container spacing={4} sx={{
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                  gridColumn: 'span 2',
                  rowGap: 3,
                  columnGap: 2,
                  width: "100%"
                }}>
                  <Field.Text name="accountNumber" label="Account Number" fullWidth sx={{ gridColumn: 'span 2' }} />
                  <Field.Text name="sortCode" label="Sort Code" sx={{ gridColumn: 'span 1' }} />
                  <Field.Text name="utrNumber" label="UTR Number" sx={{ gridColumn: 'span 1' }} />
                </Grid>
              </Card>
            </Box>
            {/* Access Control */}
            <Card
              sx={{
                padding: '20px',
                marginY: '10px',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#919eab', m: 1 }}>
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
                    borderRadius: "8px",
                    padding: '10px',
                    margin: '5px',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#919eab' }}>
                    Universities & Courses
                  </Typography>
                  <Controller
                    name="showUniversities"
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
                    borderRadius: "8px",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#919eab' }}>
                    Intakes
                  </Typography>
                  <Controller
                    name="showIntakes"
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
            </Card>
            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={isSubmitting} // disable if form invalid or submitting
              >
                {
                  // currentAgent ? 'Save changes' :
                  'Create agent'
                }
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
};