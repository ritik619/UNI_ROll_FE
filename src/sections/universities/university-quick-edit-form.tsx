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

import { uploadFileAndGetURL } from 'src/auth/context';

// ----------------------------------------------------------------------

export type UniversityQuickEditSchemaType = zod.infer<typeof UniversityQuickEditSchema>;

export const UniversityQuickEditSchema = zod.object({
  logoUrl: schemaHelper.file().nullable().optional(),
  name: zod.string().min(1, { message: 'University name is required!' }),
  cityId: zod.string().min(1, { message: 'City ID is required!' }),
  description: zod.string().max(500).optional(),
  website: zod.string().url({ message: 'Website must be a valid URL!' }).optional(),
  status: zod.enum(['active', 'inactive']).default('active'),
  countryCode:zod.string().optional(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: (data?:IUniversity) => void;
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
        logoUrl: currentUniversity.logoUrl || null,
        status: currentUniversity.status || 'active',
        countryCode: currentUniversity.countryCode|| "",
      }
      : defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  // Watch the Country field value in real-time
  const selectedCountry = watch('countryCode');

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

    const formData = {
      logoUrl: data.logoUrl,
      name: data.name!.trim(),
      cityId: data.cityId!.trim(),
      status: data.status,
    } as any;
    if (data?.description) {
      formData.description = data?.description?.trim() || '';
    }
    if (data?.website) {
      formData.website = data?.website?.trim() || '';
    }

    // Then handle profile photo upload if available
    if (data.logoUrl instanceof File) {
      const fileName = `${currentUniversity?.id}.${data.logoUrl.name.split('.').pop()}`;
      const url = await uploadFileAndGetURL(data.logoUrl, `agent/${fileName}`);
      formData['logoUrl'] = url;
    } else {
      formData['logoUrl'] = data.logoUrl as string;
    }

    return await authAxiosInstance.patch(endpoints.universities.details(currentUniversity.id), formData);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await updateUniversity(data);
      toast.success('University updated successfully!');
      router.push(paths.dashboard.universitiesAndCourses.listUniversities);
      if(response){
        onClose(response.data);
      }
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
            <Field.Select name="status" label="Status" sx={{ gridColumn: 'span 1' }}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
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
