import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
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

// ----------------------------------------------------------------------

const PaymentAssociationSchema = zod.object({
  studentId: zod.string().min(1, 'Student ID is required'),
  // courseId: zod.string().min(1, 'Course ID is required'),
  paymentAmount: zod.number().min(1, 'Payment amount must be greater than 0'),
  currency: zod.string().min(1),
  paymentDate: zod.string(),
  paymentStatus: zod.enum(['pending', 'completed', 'failed']),
});

type PaymentAssociationFormType = zod.infer<typeof PaymentAssociationSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  studentId: string;
};

export function StudentQuickAddPaymentAssociationForm({ open, onClose, studentId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [students, setStudents] = useState<IStudentsItem[]>([]);

  const defaultValues: PaymentAssociationFormType = {
    studentId: studentId,
    paymentAmount: 0,
    currency: 'USD',
    paymentDate: '',
    paymentStatus: 'pending',
  };

  const methods = useForm<PaymentAssociationFormType>({
    mode: 'all',
    resolver: zodResolver(PaymentAssociationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  console.log('errors', errors);
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        studentId,
      };
      await createPaymentAssociation(payload);
      toast.success('Payment completed successfully!');
      router.refresh(); // or `router.push()` if needed
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to complete payment');
    }
  });

  const fetchPaginatedCourses = useCallback(async () => {
    try {
      setLoading(true);
      const { courses: c, total } = await fetchCourses('active');
      setCourses(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch students - replace with your actual API call
      const student = await authAxiosInstance.get(`${endpoints.students}/${studentId}`);
      setStudents([students]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [studentId]); // Add studentId to the dependencies

  useEffect(() => {
    fetchPaginatedCourses(); // No change here, you still need the courses
    fetchStudents(); // This will fetch only the student based on studentId
  }, [fetchPaginatedCourses, fetchStudents]);

  useEffect(() => {
    fetchPaginatedCourses();
    fetchStudents();
  }, [fetchPaginatedCourses, fetchStudents]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>Associate a Payment with Student</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              py: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Text name="paymentAmount" label="Payment Amount" type="number" />
            {/* <Field.Text name="currency" label="Currency (e.g. USD)" /> */}
            <Field.DatePicker name="paymentDate" label="Payment Date (ISO)" />
            <Field.Select name="paymentStatus" label="Payment Status">
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Field.Select>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Create
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
