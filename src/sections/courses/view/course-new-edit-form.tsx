'use client';

import type { ICourse, ICreateCourse } from 'src/types/course';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { fetchUniversities } from 'src/services/universities/fetchUniversities';

// ----------------------------------------------------------------------

export const NewCourseSchema = zod
  .object({
    name: zod.string().min(1, { message: 'Course name is required!' }),
    code: zod.string().min(1, { message: 'Course code is required!' }),
    universityId: zod.string().min(1, { message: 'University is required!' }),
    description: zod.string().optional(),
    durationYears: zod.number().min(0).max(10).optional(),
    durationMonths: zod.number().min(1).max(12).optional(),
    tuitionFee: zod.number().optional(),
    startDates: zod.array(zod.string()).optional(),
    newStartDate: zod.any().optional(), // For the date picker
    status: zod.enum(['active', 'inactive']).default('active'),
  })
  .refine(
    (data) => {
      // Ensure at least months or years has a value > 0
      if (
        (data.durationYears === 0 || data.durationYears === undefined) &&
        (data.durationMonths === undefined || data.durationMonths === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Course must have a duration (at least 1 month)',
      path: ['durationMonths'],
    }
  );

export type NewCourseSchemaType = zod.infer<typeof NewCourseSchema>;

// This type matches our ICreateCourse with Zod validation
export type CreateCourseType = ICreateCourse;

// ----------------------------------------------------------------------

type Props = {
  currentCourse?: ICourse;
};

export function CourseNewEditForm({ currentCourse }: Props) {
  const router = useRouter();
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
  const [startDates, setStartDates] = useState<string[]>(currentCourse?.startDates || []);

  // Generate year options (0-10)
  const yearOptions = Array.from({ length: 11 }, (_, i) => ({
    value: i,
    label: i === 1 ? `${i} Year` : `${i} Years`,
  }));

  // Generate month options (1-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: i + 1 === 1 ? `${i + 1} Month` : `${i + 1} Months`,
  }));

  useEffect(() => {
    const getUniversities = async () => {
      try {
        const { universities:uni } =await fetchUniversities('active', 1, 100);
        console.log('universities', uni);
        setUniversities(uni || []);
      } catch (error) {
        console.error('Failed to fetch universities', error);
        toast.error('Failed to fetch universities');
      }
    };

    getUniversities();
  }, []);

  const defaultValues: NewCourseSchemaType = {
    name: '',
    code: '',
    universityId: '',
    description: '',
    durationYears: 0,
    durationMonths: 1,
    tuitionFee: undefined,
    startDates: [],
    newStartDate: null,
    status: 'active',
  };
  console.log('defaultValues', universities);
  const methods = useForm<NewCourseSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewCourseSchema),
    defaultValues,
    values: currentCourse
      ? {
          name: currentCourse.name || '',
          code: currentCourse.code || '',
          universityId: currentCourse.universityId || '',
          description: currentCourse.description || '',
          durationYears: currentCourse.durationYears || 0,
          durationMonths: currentCourse.durationMonths || 0,
          tuitionFee: currentCourse.tuitionFee,
          startDates: currentCourse.startDates || [],
          newStartDate: null,
          status: currentCourse.status || 'active',
        }
      : defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const watchNewStartDate = watch('newStartDate');

  const handleAddStartDate = () => {
    if (watchNewStartDate) {
      const date=new Date(watchNewStartDate)
      console.log('Adding start date:', date);
      const dateString = date.toISOString().split('T')[0];
      if (!startDates.includes(dateString)) {
        const updatedDates = [...startDates, dateString];
        setStartDates(updatedDates);
        setValue('startDates', updatedDates);
        setValue('newStartDate', null);
      }
    }
  };

  const handleRemoveStartDate = (index: number) => {
    const updatedDates = startDates.filter((_, i) => i !== index);
    setStartDates(updatedDates);
    setValue('startDates', updatedDates);
  };

  const createCourse = async (data: ICreateCourse) => {
    console.log('Creating course with data:', data);
        // Create a direct payload object instead of using formData
    const payload = {
      name: data.name.trim(),
      code: data.code.trim(),
      universityId: data.universityId.trim(),
      description: data.description?.trim(),
      durationYears: data.durationYears !== undefined ? Number(data.durationYears) : undefined,
      durationMonths: data.durationMonths !== undefined ? Number(data.durationMonths) : undefined,
      tuitionFee: data.tuitionFee ? Number(data.tuitionFee) : undefined,
      startDates: data.startDates && data.startDates.length > 0 ? data.startDates : undefined,
      status: data.status,
    };

    const response = await authAxiosInstance.post<{ id: string }>(endpoints.courses.list, payload);
    return response;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createCourse(data);
      toast.success(currentCourse ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.universitiesAndCourses.root);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Something went wrong');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Course Details
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
                name="name"
                label="Course Name"
                placeholder="Bachelor of Computer Science"
                helperText="Enter the full name of the course"
              />

              <Field.Text
                name="code"
                label="Course Code"
                placeholder="CS-BSC-01"
                helperText="Enter a unique course code"
              />

              <Field.Select
                name="universityId"
                label="University"
                helperText="Select the university offering this course"
              >
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {universities.map((university) => (
                  <MenuItem key={university.id} value={university.id}>
                    {university.name} {" "} ({university.cityName})
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Select
                name="status"
                label="Status"
                helperText="Set the current status of this course"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Field.Select>

              <Stack spacing={2}>
                <Typography variant="subtitle2">Course Duration</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Field.Select name="durationYears" label="Years" sx={{ flex: 1 }}>
                    {yearOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field.Select>

                  <Field.Select name="durationMonths" label="Months" sx={{ flex: 1 }}>
                    {monthOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Course must have a duration of at least 1 month
                </Typography>
              </Stack>

              <Field.Text
                type="number"
                name="tuitionFee"
                label="Tuition Fee"
                placeholder="0.00"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>£</Box>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Stack spacing={1.5} sx={{ gridColumn: 'span 2' }}>
                <Typography variant="subtitle2">Course Start Dates</Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Field.DatePicker name="newStartDate" label="Add Start Date" sx={{ flex: 1 }} />

                  <LoadingButton
                    variant="contained"
                    onClick={handleAddStartDate}
                    disabled={!watchNewStartDate}
                    type="button"
                  >
                    Add Date
                  </LoadingButton>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Add all available start dates for this course
                  </Typography>
                </Box>

                {startDates.length > 0 ? (
                  <Stack spacing={1} direction="row" flexWrap="wrap" sx={{ mb: 2 }}>
                    {startDates.map((date, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'action.selected',
                        }}
                      >
                        <Iconify icon="solar:calendar-line-duotone" width={20} />
                        <Typography variant="body2">
                          {new Date(date).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                        <Box
                          component="button"
                          type="button"
                          onClick={() => handleRemoveStartDate(index)}
                          sx={{
                            ml: 0.5,
                            border: 0,
                            p: 0,
                            bgcolor: 'transparent',
                            color: 'error.main',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 },
                          }}
                        >
                          <Iconify icon="solar:close-circle-bold" width={18} />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No start dates added yet
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Field.Text
                name="description"
                label="Course Description"
                multiline
                rows={4}
                placeholder="Enter a detailed description of the course..."
                helperText="Include important details like learning outcomes, modules, etc."
                sx={{ gridColumn: 'span 2' }}
              />
            </Box>

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <LoadingButton
                color="inherit"
                variant="outlined"
                onClick={() => router.push(paths.dashboard.universitiesAndCourses.root)}
              >
                Cancel
              </LoadingButton>

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentCourse ? 'Create Course' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}