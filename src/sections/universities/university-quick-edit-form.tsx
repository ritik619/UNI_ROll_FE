import type { IUniversity, IUpdateUniversity } from 'src/types/university';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';

import { fData } from 'src/utils/format-number';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type UniversityQuickEditSchemaType = zod.infer<typeof UniversityQuickEditSchema>;

export const UniversityQuickEditSchema = zod.object({
  logoUrl: schemaHelper.file().nullable().optional(),
  name: zod.string().min(1, { message: 'University name is required!' }),
  cityId: zod.string().min(1, { message: 'City ID is required!' }),
  description: zod.string().optional(),
  website: zod.string().url({ message: 'Website must be a valid URL!' }).optional(),
  status: zod.enum(['active', 'inactive']).default('active'),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentUniversity?: IUniversity;
};

export function UniversityQuickEditForm({ currentUniversity, open, onClose }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const defaultValues: UniversityQuickEditSchemaType = {
    name: '',
    cityId: '',
    description: '',
    website: '',
    logoUrl: null,
    status: 'active',
  };

  const methods = useForm<UniversityQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(UniversityQuickEditSchema),
    defaultValues,
    values: currentUniversity
      ? {
          name: currentUniversity.name || '',
          cityId: currentUniversity.cityId || '',
          description: currentUniversity.description || '',
          website: currentUniversity.website || '',
          logoUrl: currentUniversity.logoUrl as File | null || null,
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

  const updateUniversity = async (data: IUpdateUniversity) => {
    if (!currentUniversity?.id) return;

    const formData = new FormData();
    
    formData.append('name', data.name!.trim());
    formData.append('cityId', data.cityId!.trim());

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

    await authAxiosInstance.patch(
      endpoints.universities.details(currentUniversity.id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateUniversity(data);
      toast.success('University updated successfully!');
      router.push(paths.dashboard.universitiesAndCourses.list);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to update university');
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
      <DialogTitle>Quick University Update</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ mb: 5 }}>
            <Field.UploadAvatar
              name="logoUrl"
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
              sx={{ gridColumn: 'span 1' }}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Field.Select>
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