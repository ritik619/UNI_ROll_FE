'use client';

import type { IIntake, ICreateIntake } from 'src/types/intake';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const NewIntakeSchema = zod.object({
  name: zod.string().min(1, { message: 'Intake name is required!' }),
  description: zod.string().optional(),
  startDate: zod.string(),
  endDate: zod.string(),
  status: zod.enum(['active', 'inactive']).default('active'),
});

export type NewIntakeSchemaType = zod.infer<typeof NewIntakeSchema>;

// This type matches our ICreateIntake with Zod validation
export type CreateIntakeType = ICreateIntake;

// ----------------------------------------------------------------------

type Props = {
  currentIntake?: IIntake;
  initialIntakeId?: string;
};

export function IntakeNewEditForm({ currentIntake, initialIntakeId }: Props) {
  const router = useRouter();
  const defaultValues: NewIntakeSchemaType = {
    name: '',
    startDate: new Date().toDateString(),
    endDate: new Date().toDateString(),
    description: '',
    status: 'active',
  };

  const methods = useForm<NewIntakeSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewIntakeSchema),
    defaultValues,
    values: currentIntake
      ? {
          name: currentIntake.name || '',
          description: currentIntake.description || '',
          startDate: currentIntake.startDate || '',
          endDate: currentIntake.endDate || '',
          status: currentIntake.status || 'active',
        }
      : defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const createIntake = async (data: ICreateIntake) => {
    // Create a direct payload object instead of using formData
    const payload = {
      name: data?.name?.trim(),
      startDate: new Date(data.startDate).toISOString(),
      description: data.description?.trim(),
      endDate: new Date(data.endDate).toISOString(),
      status: data.status,
      // feeCurrency: 'USD',
    };

    const response = await authAxiosInstance.post<{ id: string }>(endpoints.intakes.list, payload);
    return response;
  };

  const updateIntake = async (data: ICreateIntake) => {
    if (!initialIntakeId) return {};

    const payload = {
      name: data.name?.trim(),
      startDate: data.startDate,
      description: data.description?.trim(),
      endDate: data.endDate,
      status: data.status,
    };
    const response = await authAxiosInstance.patch<{ id: string }>(
      `${endpoints.intakes.details(initialIntakeId)}`,
      payload
    );
    return response;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Make sure total months is updated before submission

      if (currentIntake) {
        await updateIntake(data);
      } else {
        await createIntake(data);
      }
      toast.success(currentIntake ? 'Update success!' : 'Create success!');

      router.push(paths.dashboard.intakes.root);
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
              Intake Details
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
                label="Intake Name"
                placeholder="Academic Batch"
                helperText="Enter the full name of the Intake"
              />

              {/* <Field.Text
                name="code"
                label="Intake Code"
                placeholder="CS-BSC-01"
                helperText="Enter a unique Intake code"
              /> */}

              {/* {currentIntake ? (
                <Field.Text
                  name="universityName"
                  label="University"
                  value={currentIntake.universityName}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="mdi:university" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="University cannot be changed after Intake creation"
                />
              ) : (
                <Field.Select
                  name="universityId"
                  label="University"
                  helperText="Select the university offering this Intake"
                >
                  <MenuItem value="">None</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {universities.map((university) => (
                    <MenuItem key={university.id} value={university.id}>
                      {university.name} ({university.cityName})
                    </MenuItem>
                  ))}
                </Field.Select>
              )} */}

              <Field.Select
                name="status"
                label="Status"
                helperText="Set the current status of this Intake"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Field.Select>

              <Field.DatePicker name="startDate" label="Start Date" />
              <Field.DatePicker name="endDate" label="End Date" />

              {/* <Stack spacing={2}>
                <Typography variant="subtitle2">Intake Duration</Typography>
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
                  Intake must have a duration of at least 1 month
                </Typography>
              </Stack> */}

              {/* <Field.Text
                type="number"
                name="tuitionFee"
                label="Tuition Fee"
                placeholder="0.00"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>$</Box>
                      </InputAdornment>
                    ),
                  },
                }}
              /> */}

              {/* <Stack spacing={1.5} sx={{ gridColumn: 'span 2' }}>
                <Typography variant="subtitle2">Intake Start Dates</Typography>

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
                    Add all available start dates for this Intake
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
              </Stack> */}

              <Field.Text
                name="description"
                label="Intake Description"
                multiline
                rows={4}
                placeholder="Enter a detailed description of the Intake..."
                helperText="Include important details like learning outcomes, modules, etc."
                sx={{ gridColumn: 'span 2' }}
              />
            </Box>

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <LoadingButton
                color="inherit"
                variant="outlined"
                onClick={() => router.push(paths.dashboard.intakes.root)}
              >
                Cancel
              </LoadingButton>

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentIntake ? 'Create Intake' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
