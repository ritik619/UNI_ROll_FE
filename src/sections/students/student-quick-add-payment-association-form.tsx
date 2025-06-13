import { z as zod } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  MenuItem,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  Stack,
  Divider,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { createPaymentAssociation } from 'src/services/students/attachPayments';
import { useCallback, useEffect, useState } from 'react';
import { fetchCourses } from 'src/services/courses/fetchCourses';
import { ICourse } from 'src/types/course';
import { IStudentsItem } from 'src/types/students';
import { Iconify } from 'src/components/iconify';
import type { IEarning } from 'src/types/paymentAssociation';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const defaultPayment = {
  amount: 0,
  paymentNumber: 1,
  status: 'Pending' as const,
  description: '',
  paymentDate: new Date().toISOString(),
};

const PaymentSchema = zod.object({
  amount: zod
    .union([zod.string(), zod.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Payment must be greater than or equal to 0',
    }),
  paymentNumber: zod
    .union([zod.string(), zod.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Payment number is required'
    }),
  status: zod.enum(['Paid', 'Pending', 'Failed']),
  description: zod.string(),
  paymentDate: zod.string().min(1, 'Payment date is required'),
});

const PaymentAssociationSchema = zod.object({
  agentId: zod.string().min(1, 'Agent ID is required'),
  universityId: zod.string().min(1, 'University ID is required'),
  studentId: zod.string().min(1, 'Student ID is required'),
  totalCommission: zod
    .union([zod.string(), zod.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Total commission must be greater than or equal to 0',
    }),
  commissionCurrency: zod.string().min(1, 'Commission currency is required'),
  // commissionPercentage: zod.number().min(0, 'Commission percentage must be greater than or equal to 0'),
  payments: zod.array(PaymentSchema).min(1, 'At least one payment is required'),
});

type PaymentAssociationFormType = zod.infer<typeof PaymentAssociationSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  studentId: string;
  universityId: string;
  agentId: string;
  courseId: string;
  intakeId: string;
  earning?: IEarning;
};

// ----------------------------------------------------------------------

function PaymentItem({ index, onRemove }: { index: number; onRemove: () => void }) {
  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="subtitle2">Payment #{index + 1}</Typography>
        {index > 0 && (
          <Button
            size="small"
            color="error"
            onClick={onRemove}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          >
            Remove
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
        }}
      >
        <Field.Text name={`payments.${index}.amount`} label="Payment Amount" type="number" />
        <Field.Text name={`payments.${index}.description`} label="Payment Description" />
        <Field.DatePicker name={`payments.${index}.paymentDate`} label="Payment Date" />
        <Field.Select name={`payments.${index}.status`} label="Payment Status">
          <MenuItem value="Paid">Paid</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
        </Field.Select>
      </Box>
    </Box>
  );
}

export function StudentQuickAddPaymentAssociationForm({
  open,
  onClose,
  studentId,
  universityId,
  agentId,
  courseId,
  intakeId,
  earning,
}: Props) {
  const router = useRouter();

  const defaultValues: PaymentAssociationFormType = {
    agentId,
    universityId,
    studentId,
    totalCommission: earning?.totalCommission ?? 0,
    commissionCurrency: earning?.commissionCurrency ?? 'GBP',
    // commissionPercentage: earning?.commissionPercentage ?? 0,
    payments: earning?.payments ?? [defaultPayment],
  };
  const methods = useForm<PaymentAssociationFormType>({
    mode: 'all',
    resolver: zodResolver(PaymentAssociationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
    reset,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'payments',
  });

  const addNewPayment = () => {
    append({
      ...defaultPayment,
      paymentNumber: fields.length + 1,
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        studentId,
        universityId,
        agentId,
        courseId,
        intakeId,
      };
      await createPaymentAssociation(payload);
      toast.success('Payment completed successfully!');
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to complete payment');
    }
  });

  // Update form values when earning changes
  useEffect(() => {
    if (earning) {
      reset({
        ...defaultValues,
        totalCommission: earning.totalCommission,
        commissionCurrency: earning.commissionCurrency,
        // commissionPercentage: earning.commissionPercentage,
        payments: earning.payments,
      });
    }
  }, [earning, reset]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>Associate a Payment with Student</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          {earning && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Current Payment Status
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Commission
                  </Typography>
                  <Typography variant="subtitle2">
                    {fCurrency(earning.totalCommission)} {earning.commissionCurrency}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Paid Amount
                  </Typography>
                  <Typography variant="subtitle2">
                    {fCurrency(earning.paidAmount)} {earning.commissionCurrency}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Remaining Amount
                  </Typography>
                  <Typography variant="subtitle2">
                    {fCurrency(earning.remainingAmount)} {earning.commissionCurrency}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              py: 2,
            }}
          >
            <Field.Text name="totalCommission" label="Total Commission" type="number" />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Payment
          </Typography>

          <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
            {fields.map((field, index) => (
              <PaymentItem key={field.id} index={index} onRemove={() => remove(index)} />
            ))}
          </Stack>

          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={addNewPayment}
            sx={{ mt: 2 }}
          >
            Add Another Payment
          </Button>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Save
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
