'use client';

import type { IUniversity, ICreateUniversity } from 'src/types/university';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { uploadFileAndGetURL } from 'src/auth/context';

// ----------------------------------------------------------------------

export const NewUniversitySchema = zod.object({
  name: zod.string().min(1, { message: 'University name is required!' }),
  cityId: zod.string().min(1, { message: 'City ID is required!' }),
  description: zod.string().optional(),
  website: zod
    .string()
    .transform((val) => {
      if (!val) return '';
      // Add https:// if URL doesn't have a protocol
      if (!/^https?:\/\//i.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine((val) => !val || /^https?:\/\/.+\..+/i.test(val), {
      message: 'Please enter a valid website address',
    })
    .optional(),
  logoUrl: zod.any().optional(),
  status: zod.enum(['active', 'inactive']).default('active'),
});

export type NewUniversitySchemaType = zod.infer<typeof NewUniversitySchema>;

// This type matches our ICreateUniversity with Zod validation
export type CreateUniversityType = ICreateUniversity;

// ----------------------------------------------------------------------

type Props = {
  currentUniversity?: IUniversity;
};

export function UniversityNewEditForm({ currentUniversity }: Props) {
  const router = useRouter();

  const defaultValues: NewUniversitySchemaType = {
    name: '',
    cityId: '',
    description: '',
    website: '',
    logoUrl: null,
    status: 'active',
  };

  const methods = useForm<NewUniversitySchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewUniversitySchema),
    defaultValues,
    values: currentUniversity
      ? {
          name: currentUniversity.name || '',
          cityId: currentUniversity.cityId || '',
          description: currentUniversity.description || '',
          website: currentUniversity.website || '',
          logoUrl: currentUniversity.logoUrl || null,
          status: currentUniversity.status || 'active',
          countryCode: currentUniversity.cityId.split('-')[0] || '',
        }
      : defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = methods;
  // Watch the Country field value in real-time
  const selectedCountry = watch('countryCode');

  const createUniversity = async (data: ICreateUniversity) => {
    const formData = {} as any;
    formData['name'] = data.name.trim();
    formData['cityId'] = data.cityId.trim();

    if (data.description) {
      formData['description'] = data.description.trim();
    }

    if (data.website) {
      formData['website'] = data.website.trim();
    }

    if (data.status) {
      formData['status'] = data.status;
    }
    if (data.logoUrl instanceof File) {
      const fileName = `${data.name}.${data.logoUrl.name.split('.').pop()}`;
      const url = await uploadFileAndGetURL(data.logoUrl, `universities/${fileName}`);
      formData['logoUrl'] = url;
    } else {
      formData['logoUrl'] = data.logoUrl as string;
    }

    const response = await authAxiosInstance.post<{ id: string }>(
      endpoints.universities.list,
      formData
    );
    return response;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createUniversity(data);
      toast.success(currentUniversity ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.universitiesAndCourses.list);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Something went wrong');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <Field.UploadAvatar
              name="logoUrl"
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
          </Card>
        </Grid>

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
              <Field.Text name="name" label="University Name" />
              <Field.Select name="status" label="Status">
                {[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ].map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.CountrySelect name="countryCode" label="Country" getValue="code" />
              {selectedCountry && (
                <Field.CitySelect
                  name="cityId"
                  label="City"
                  countryCode={selectedCountry}
                  getValue="cityId"
                />
              )}
              <Field.Text
                name="description"
                label="Description"
                multiline
                rows={3}
                sx={{ gridColumn: 'span 2' }}
              />
              <Field.Text name="website" label="Website" />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUniversity ? 'Create University' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
