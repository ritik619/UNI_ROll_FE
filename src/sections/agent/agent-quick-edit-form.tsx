import type { IAgentItem } from 'src/types/agent';

import { z as zod } from 'zod';
import router from 'next/router';
import { Controller, useForm } from 'react-hook-form';
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
import { Card, Grid, Switch, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { fData } from 'src/utils/format-number';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { uploadFileAndGetURL } from 'src/auth/context';

import { useEffect } from 'react';
import { toDMY } from 'src/utils/format-date';

// ----------------------------------------------------------------------

export const AgentQuickEditSchema = zod.object({
  // avatarUrl: schemaHelper.file().nullable().optional(),
  firstName: zod
    .string()
    .min(1, { message: 'First Name is required!' })
    .transform((str) => str.trim()),
  lastName: zod
    .string()
    .min(1, { message: 'Last Name is required!' })
    .transform((str) => str.trim()),
  dateOfBirth: zod.string().min(1, { message: 'Date of Birth is required!' }),
  email: zod.string().email({ message: 'Email must be a valid email address!' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  postCode: zod.string().min(1, { message: 'Post code is required!' }),
  accountNumber: zod.string().min(1, { message: 'Account number is required' }),
  sortCode: zod.string().min(1, { message: 'Sort code is required' }),
  utrNumber: zod.string().min(1, { message: 'UTR number is required' }),
  status: zod.string(),
  showUniversities: zod.boolean(),
  showIntakes: zod.boolean(),
});

export type AgentQuickEditSchemaType = zod.infer<typeof AgentQuickEditSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onCloseandUpdate: (c: boolean) => void;
  currentAgent?: IAgentItem;
};

export function AgentQuickEditForm({ currentAgent, open, onClose, onCloseandUpdate }: Props) {
  const defaultValues: AgentQuickEditSchemaType = {
    // avatarUrl: null,
    firstName: currentAgent?.firstName ?? '',
    lastName: currentAgent?.lastName ?? '',
    dateOfBirth: toDMY(currentAgent?.dateOfBirth).toDateString(),
    email: currentAgent?.email ?? '',
    address: currentAgent?.address ?? '',
    postCode: currentAgent?.postCode ?? '',
    accountNumber: currentAgent?.bankDetails?.accountNumber ?? '',
    sortCode: currentAgent?.bankDetails?.sortCode ?? '',
    utrNumber: currentAgent?.utrNumber ?? '',
    status: currentAgent?.status ?? '',
    showUniversities: currentAgent?.showUniversities ?? false,
    showIntakes: currentAgent?.showIntakes ?? false,
  };
  console.log(toDMY(currentAgent?.dateOfBirth), 'toDMY');

  const methods = useForm<AgentQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(AgentQuickEditSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const updateAgent = async (data: AgentQuickEditSchemaType) => {
    if (!currentAgent?.id) throw new Error('Agent ID missing');

    // let avatarUrl = data.avatarUrl;

    // if (data.avatarUrl instanceof File) {
    //   const extension = data.avatarUrl.name.split('.').pop();
    //   const fileName = `${currentAgent.id}.${extension}`;
    //   avatarUrl = await uploadFileAndGetURL(data.avatarUrl, `agent/${fileName}`);
    // }

    const payload = {
      // avatarUrl: data.avatarUrl ?? null,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dateOfBirth: data.dateOfBirth,
      email: data.email.trim().toLowerCase(),
      address: data.address.trim(),
      postCode: data.postCode.trim(),
      bankDetails: {
        accountNumber: data.accountNumber.trim(),
        sortCode: data.sortCode.trim(),
      },
      utrNumber: data.utrNumber.trim(),
      status: data.status,
      showUniversities: data.showUniversities,
      showIntakes: data.showIntakes,
    };

    return authAxiosInstance.patch<{ id: string }>(
      endpoints.agents.details(currentAgent.id),
      payload
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateAgent(data);
      toast.success('Agent updated successfully!');
      onCloseandUpdate(true);
      // router.push(paths.dashboard.agent.list);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update agent. Please try again.');
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 720 } }}
      aria-labelledby="agent-quick-edit-dialog"
    >
      <DialogTitle id="agent-quick-edit-dialog">Quick Update</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers>
          {currentAgent?.status === 'inactive' && (
            <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
              Account is waiting for confirmation
            </Alert>
          )}

          {/* <Box sx={{ mb: 5 }}>
            <Field.UploadAvatar
              name="avatarUrl"
              maxSize={3145728} // 3MB
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
                  Allowed file types: *.jpeg, *.jpg, *.png, *.gif
                  <br />
                  Max size: {fData(3145728)}
                </Typography>
              }
            />
          </Box> */}

          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Field.Select name="status" label="Status" sx={{ gridColumn: 'span 2' }}>
              {USER_STATUS_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Text name="firstName" label="First Name" />
            <Field.Text name="lastName" label="Last Name" />
            <Field.DatePicker name="dateOfBirth" label="Date of Birth" />
            <Field.Text name="email" label="Email Address" />
            <Field.Text name="address" label="Address" />
            <Field.Text name="postCode" label="Post Code" />

            <Grid xs={12} sx={{ gridColumn: 'span 2' }}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Bank Details
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    rowGap: 3,
                    columnGap: 2,
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  <Field.Text name="accountNumber" label="Account Number" />
                  <Field.Text name="sortCode" label="Sort Code" />
                </Box>
              </Card>
            </Grid>

            <Field.Text name="utrNumber" label="UTR Number" sx={{ gridColumn: 'span 2' }} />
          </Box>

          <Card sx={{ p: 3, my: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Access Control
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Card
                sx={{
                  flex: 1,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Universities & Courses
                </Typography>
                <Controller
                  name="showUniversities"
                  control={methods.control}
                  render={({ field }) => <Switch {...field} checked={field.value} />}
                />
              </Card>

              <Card
                sx={{
                  flex: 1,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Intakes
                </Typography>
                <Controller
                  name="showIntakes"
                  control={methods.control}
                  render={({ field }) => <Switch {...field} checked={field.value} />}
                />
              </Card>
            </Box>
          </Card>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
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
