import { Card, Stack, Typography, TextField } from '@mui/material';

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';

import { IStudentsItem } from 'src/types/students';
import { Form } from 'src/components/hook-form';

type Props = {
  student: IStudentsItem;
  onRefresh: () => void;
};

type FormValues = {
  examDate: Date | null;
  examTime: Date | null;
};

export function StudentBookingView({ student, onRefresh }: Props) {
  const methods = useForm<FormValues>({
    defaultValues: {
      examDate: null,
      examTime: null,
    },
  });

  const { control, handleSubmit } = methods;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log('Form data:', data);
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
        </Card>
      </Stack>
    </Form>
  );
}
