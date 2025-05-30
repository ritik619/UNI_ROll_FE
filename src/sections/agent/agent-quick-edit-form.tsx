import type { IAgentItem } from 'src/types/agent';

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

import { USER_STATUS_OPTIONS } from 'src/_mock';
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { uploadFileAndGetURL } from 'src/auth/context';

// ----------------------------------------------------------------------

export type AgentQuickEditSchemaType = zod.infer<typeof AgentQuickEditSchema>;

export const AgentQuickEditSchema = zod.object({
  avatarUrl: schemaHelper.file().nullable().optional(),
  firstName: zod.string().min(1, { message: 'First Name is required!' }),
  lastName: zod.string().min(1, { message: 'Last Name is required!' }),
  dateOfBirth: zod.string().min(1, { message: 'Date of Birth is required!' }),
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
  // password: zod.string().min(8, { message: 'Password must be at least 8 characters long!' }),
  status: zod.string(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentAgent?: IAgentItem;
};

export function AgentQuickEditForm({ currentAgent, open, onClose }: Props) {
  const defaultValues: AgentQuickEditSchemaType = {
    status: '',
    avatarUrl: null,
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date().toString(),
    accountNumber: '',
    address: '',
    postCode: '',
    sortCode: '',
    utrNumber: '',
    // password: '',
  };

  const methods = useForm<AgentQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(AgentQuickEditSchema),
    defaultValues,
    values: {
      accountNumber: currentAgent?.bankDetails?.accountNumber,
      sortCode: currentAgent?.bankDetails.sortCode,
      ...currentAgent,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const updateAgent = async (data: AgentQuickEditSchemaType) => {
    const payload = {
      avatarUrl: data.avatarUrl ?? null,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dateOfBirth: data.dateOfBirth,
      email: data.email.trim(),
      address: data.address.trim(),
      postCode: data.postCode.trim(),
      bankDetails: {
        accountNumber: data.accountNumber.trim(),
        sortCode: data.sortCode.trim(),
      },
      utrNumber: data.utrNumber.trim(),
      status: 'active',
    };

    const uId = currentAgent?.id || '';
    // Then handle profile photo upload if available
    if (data.avatarUrl instanceof File) {
      const fileName = `${uId}.${data.avatarUrl.name.split('.').pop()}`;
      const url = await uploadFileAndGetURL(data.avatarUrl, `agent/${fileName}`);
      payload['avatarUrl'] = url;
    } else {
      payload['avatarUrl'] = data.avatarUrl as string;
    }
    return await authAxiosInstance.patch<{ id: string }>(endpoints.agents.details(uId), payload);
  };

  const onSubmit = handleSubmit(async (data) => {
    console.log('onSubmit', data);
    try {
      await updateAgent(data);
      toast.success(currentAgent ? 'Update success!' : 'Update error!');
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
          {currentAgent?.status === 'inactive' && (
            <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
              Account is waiting for confirmation
            </Alert>
          )}
          <Box sx={{ mb: 5 }}>
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
          </Box>
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
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Field.Select>
            <Field.Text name="firstName" label="First Name" />
            <Field.Text name="lastName" label="Last Name" />
            <Field.DatePicker name="dateOfBirth" label="Date of Birth" />
            <Field.Text name="email" label="Email Address" />
            <Field.Text name="address" label="Address" />
            <Field.Text name="postCode" label="Post Code" />

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
            </Grid2>

            <Field.Text name="utrNumber" label="UTR Number" sx={{ gridColumn: 'span 2' }} />
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
