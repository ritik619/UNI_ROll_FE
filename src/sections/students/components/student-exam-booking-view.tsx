import { useState, useEffect } from 'react';
import { Card, Stack, Typography, Button, Box } from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';

import { IStudentsItem, IBooking } from 'src/types/students'; // Importing types
import { Form } from 'src/components/hook-form';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { toast } from 'src/components/snackbar';

type Props = {
  student: IStudentsItem;
  booking: IBooking;
  onRefresh: () => void;
};

type FormValues = {
  examDate: Date | null;
  examTime: Date | null;
};

export function StudentExamBookView({ student, booking, onRefresh }: Props) {
  const methods = useForm<FormValues>({
    defaultValues: {
      examDate: new Date(booking?.examDate) ?? null, // Initialize with existing booking or null
      examTime: booking?.examTime ? new Date(booking.examTime) : null, // Handle examTime if available
    },
  });

  const { control, handleSubmit } = methods;
  const [loading, setLoading] = useState(false);

  // Handle form submission and API call
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const bookingData: IBooking = {
      examDate: data.examDate,
      examTime: data.examTime ? data.examTime.toISOString() : '', // Ensure the examTime is in ISO format
    };

    setLoading(true);

    try {
      const response = await authAxiosInstance.patch(
        endpoints.students.sendBookingForm(student.id),
        bookingData
      );

      if (response.status === 200) {
        toast.success('Exam booking successfully updated!');
        onRefresh(); // Refresh data after update
      } else {
        toast.error('Failed to update exam booking');
      }
    } catch (error) {
      toast.error('An error occurred while updating the exam booking');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <Card sx={{ p: 3, flex: 1 }}>
          <Stack spacing={2} sx={{ padding: '10px' }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Exam Booking Date & Time
            </Typography>
          </Stack>

          <Stack spacing={2} direction="row" sx={{ padding: '10px' }}>
            <Controller
              name="examDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Exam Date"
                  slotProps={{ textField: { fullWidth: true } }}
                />
              )}
            />

            <Controller
              name="examTime"
              control={control}
              render={({ field }) => (
                <TimePicker
                  {...field}
                  label="Exam Time"
                  slotProps={{ textField: { fullWidth: true } }}
                />
              )}
            />
          </Stack>

          <Box mt={2} sx={{ padding: '10px' }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Exam Booking'}
            </Button>
          </Box>
        </Card>
      </Stack>
    </Form>
  );
}
