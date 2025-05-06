'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { UploadAvatar } from 'src/components/upload';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

import type { IUniversity, ICreateUniversity } from 'src/types/university';

// ----------------------------------------------------------------------

export const NewUniversitySchema = zod.object({
  name: zod.string().min(1, { message: 'University name is required!' }),
  cityId: zod.string().min(1, { message: 'City ID is required!' }),
  description: zod.string().optional(),
  website: zod.string().url({ message: 'Website must be a valid URL!' }).optional(),
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
  const auth = useAuthContext();
  const authToken = auth.user?.accessToken;

  const [file, setFile] = useState<File | null>(null);

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
        }
      : defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleDropAvatar = useCallback(
    (acceptedFiles: File[]) => {
      const newFile = acceptedFiles[0];
      if (newFile) {
        setFile(newFile);
        setValue('logoUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const createUniversity = async (data: ICreateUniversity) => {
    const formData = new FormData();
    formData.append('name', data.name.trim());
    formData.append('cityId', data.cityId.trim());

    if (data.description) {
      formData.append('description', data.description.trim());
    }

    if (data.website) {
      formData.append('website', data.website.trim());
    }

    if (data.status) {
      formData.append('status', data.status);
    }

    if (file) {
      formData.append('logo', file);
    }

    const response = await authAxiosInstance.post<{ id: string }>(
      endpoints.universities.list,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
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
            <UploadAvatar
              file={file}
              accept={{ 'image/*': [] }}
              maxSize={3145728}
              onDrop={handleDropAvatar}
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
                  <br /> max size of 3.1 MB
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
              <Field.Text name="cityId" label="City ID" />
              <Field.Text
                name="description"
                label="Description"
                multiline
                rows={3}
                sx={{ gridColumn: 'span 2' }}
              />
              <Field.Text name="website" label="Website" />
              <Field.Select
                name="status"
                label="Status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
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
