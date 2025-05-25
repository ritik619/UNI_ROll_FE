import type { IStudentsItem } from 'src/types/students';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
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
import { formatDateToDDMMYYYY } from 'src/utils/format-date';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { uploadFileAndGetURL } from 'src/auth/context';
import { uuidv4 } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

export const NewStudentsSchema = zod.object({
  fName: zod.string().min(1, { message: 'First Name is required!' }),
  lName: zod.string().min(1, { message: 'Last Name is required!' }),
  dob: zod.string().min(1, { message: 'Date of Birth is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Valid email required' }),
  // phonePrefix: zod.string().min(1, { message: 'Phone Prefix is required!' }),
  phoneNumber: zod.string().min(5, { message: 'Phone Number is required!' }),
  nationality: zod.string().min(1, { message: 'Nationality is required!' }),
  sex: zod.string().min(1, { message: 'Sex is required!' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  postCode: zod.string().min(1, { message: 'Post Code is required!' }),
  // university: zod.string().min(1, { message: 'University Name is required!' }),
  // courses: zod.string().min(1, { message: 'Courses is required!' }),
  // status: zod.enum(['free', 'interested', 'enrolled', 'unenrolled']).optional(),
  coverPhoto: zod.any().optional(),
});

export type NewStudentsSchemaType = zod.infer<typeof NewStudentsSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentStudent?: IStudentsItem;
};

export function StudentsNewEditForm({ currentStudent }: Props) {
  const router = useRouter();

  const defaultValues: NewStudentsSchemaType = {
    fName: currentStudent?.firstName || '',
    lName: currentStudent?.lastName || '',
    email: currentStudent?.email || '',
    dob: currentStudent?.dateOfBirth || '',
    // phonePrefix: '+91',
    phoneNumber: currentStudent?.phoneNumber || '',
    nationality: currentStudent?.nationality || '',
    sex: currentStudent?.sex || '',
    address: currentStudent?.address || '',
    postCode: currentStudent?.postCode || '',
    coverPhoto: currentStudent?.coverPhoto,
    // university: '',
    // courses: '',
    // status: 'free',
  };

  const methods = useForm<NewStudentsSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewStudentsSchema),
    defaultValues,
    // values: currentStudent,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  console.log('currentStudent', methods);
  const createStudents = async (data: NewStudentsSchemaType) => {
    if (data.coverPhoto instanceof File) {
      const fileName = `${uuidv4}.${data.coverPhoto.name.split('.').pop()}`;
      const url = await uploadFileAndGetURL(data.coverPhoto, `students/${fileName}`);

      data['coverPhoto'] = url;
    } else {
      data['coverPhoto'] = data.coverPhoto as string;
    }
    const payload = {
      coverPhoto: data.coverPhoto,

      firstName: data.fName.trim(),
      lastName: data.lName.trim(),
      dateOfBirth: formatDateToDDMMYYYY(new Date(data.dob)),
      email: data.email.trim(),
      phonePrefix: '+91', // Assuming a default phone prefix, can be made dynamic
      phoneNumber: data.phoneNumber.trim(),
      nationality: data.nationality.trim(),
      sex: data.sex.trim(),
      address: data.address.trim(),
      postCode: data.postCode.trim(),
      // university: data.university.trim(),
      // courses: data.courses.trim(),
      agentId: '56cvuSccZKSfJk30kjQdkRQsAKk1'.trim(),
      // status: data.status || 'free',
    };

    const response = await authAxiosInstance.post<{ id: string }>(endpoints.students.list, payload);
    return response;
  };
  const updateStudent = async (data: NewStudentsSchemaType) => {
    if (data.coverPhoto instanceof File) {
      const fileName = `${uuidv4()}.${data.coverPhoto.name.split('.').pop()}`;
      const url = await uploadFileAndGetURL(data.coverPhoto, `students/${fileName}`);

      data['coverPhoto'] = url;
    } else {
      data['coverPhoto'] = data.coverPhoto as string;
    }
    const payload = {
      coverPhoto: data.coverPhoto,
      firstName: data.fName.trim(),
      lastName: data.lName.trim(),
      dateOfBirth: formatDateToDDMMYYYY(new Date(data.dob)),
      email: data.email.trim(),
      // phonePrefix: data.phonePrefix.trim(),
      phoneNumber: data.phoneNumber.trim(),
      nationality: data.nationality.trim(),
      sex: data.sex.trim(),
      address: data.address.trim(),
      postCode: data.postCode.trim(),
      // university: data.university.trim(),
      // courses: data.courses.trim(),
      agentId: '56cvuSccZKSfJk30kjQdkRQsAKk1'.trim(),
      // status: data.status || 'free',
    };

    const response = await authAxiosInstance.patch<{ id: string }>(
      endpoints.students.details(currentStudent?.id),
      payload
    );
    return response;
  };

  const onSubmit = handleSubmit(async (data: any) => {
    try {
      if (!currentStudent) {
        await createStudents(data);
        toast.success(currentStudent ? 'Update success!' : 'Create success!');
      } else {
        await updateStudent(data);
        toast.success(currentStudent ? 'Update success!' : 'Create success!');
      }
      router.push(paths.dashboard.students.list);
    } catch (error: any) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <Field.UploadAvatar
              name="coverPhoto"
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
              <Field.Text name="fName" label="First Name" />
              <Field.Text name="lName" label="Last Name" />
              <Field.DatePicker name="dob" label="Date of Birth" />
              <Field.Text name="email" label="Email Address" />
              <Field.Phone
                name="phoneNumber"
                label="Country Code"
                // getValue="phone"
                // size="small"
                id="phoneNumber"
              />
              {/* <Field.Text name="phoneNumber" label="Phone Number" /> */}
              <Field.CountrySelect
                name="nationality"
                label="Country"
                getValue="name"
                id="nationality"
              />
              <Field.Select name="sex" label="Sex">
                {[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Other', value: 'Other' },
                ].map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Text name="postCode" label="Post Code" />
              {/* <Field.Text name="university" label="University" />
              <Field.Text name="courses" label="Courses" /> */}
              <Field.Text name="address" label="Address" sx={{ gridColumn: 'span 2' }} />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentStudent ? 'Create Student' : 'Save changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
