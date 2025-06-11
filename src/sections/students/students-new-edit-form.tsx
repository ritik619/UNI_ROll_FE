import type { IStudentsItem } from 'src/types/students';
import type { IIntake } from 'src/types/intake';
import type { ICourseAssociation } from 'src/types/courseAssociation';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Tooltip } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';
import { formatDateToDDMMYYYY, toDMY } from 'src/utils/format-date';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import { fetchIntakes } from 'src/services/Intakes/fetchIntakes';
import { fetchAssociations } from 'src/services/associations/fetchAssociations';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { uploadFileAndGetURL } from 'src/auth/context';
import { uuidv4 } from 'minimal-shared/utils';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

export const NewStudentsSchema = zod.object({
  leadNo: zod.string().min(1, { message: 'Lead Number is required!' }),
  fName: zod.string().min(1, { message: 'First Name is required!' }),
  lName: zod.string().min(1, { message: 'Last Name is required!' }),
  dob: zod.string().min(1, { message: 'Date of Birth is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Valid email required' }),
  phoneNumber: zod.string().min(5, { message: 'Phone Number is required!' }),
  emergencyNumber: zod.string().optional(),
  emergencyName: zod.string().optional(),
  nationality: zod.string().min(1, { message: 'Nationality is required!' }),
  sex: zod.string().min(1, { message: 'Sex is required!' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  postCode: zod.string().min(1, { message: 'Post Code is required!' }),
  coverPhoto: zod.any().optional(),
  // Enrollment fields
  universityId: zod.string().optional(),
  courseId: zod.string().optional(),
  intakeId: zod.string().optional(),
});

export type NewStudentsSchemaType = zod.infer<typeof NewStudentsSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentStudent?: IStudentsItem;
};

export function StudentsNewEditForm({ currentStudent }: Props) {
  const router = useRouter();
  const [associations, setAssociations] = useState<ICourseAssociation[]>([]);
  const [intakes, setIntakes] = useState<IIntake[]>([]);

  const defaultValues: NewStudentsSchemaType = {
    leadNo: currentStudent?.leadNumber || '',
    fName: currentStudent?.firstName || '',
    lName: currentStudent?.lastName || '',
    email: currentStudent?.email || '',
    dob: toDMY(currentStudent?.dateOfBirth).toDateString(),
    phoneNumber: currentStudent?.phoneNumber || '',
    emergencyNumber: currentStudent?.emergencyNumber || '',
    emergencyName: currentStudent?.emergencyName || '',
    nationality: currentStudent?.nationality || '',
    sex: currentStudent?.sex || '',
    address: currentStudent?.address || '',
    postCode: currentStudent?.postCode || '',
    coverPhoto: currentStudent?.coverPhoto,
    universityId: '',
    courseId: '',
    intakeId: '',
  };

  const methods = useForm<NewStudentsSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewStudentsSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;

  const watchUniversityId = watch('universityId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [associationsData, intakesData] = await Promise.all([
          fetchAssociations('active'),
          fetchIntakes('active'),
        ]);
        setAssociations(associationsData.courseAssociations);
        setIntakes(intakesData.intakes);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to fetch universities and courses');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    methods.setValue('courseId', '');
  }, [watchUniversityId, methods]);

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
      leadNumber: data.leadNo.trim(),
      firstName: data.fName.trim(),
      lastName: data.lName.trim(),
      dateOfBirth: formatDateToDDMMYYYY(new Date(data.dob)),
      email: data.email.trim(),
      phonePrefix: '+91',
      phoneNumber: data.phoneNumber.trim(),
      ...(data.emergencyNumber && { emergencyNumber: data.emergencyNumber.trim() }),
      ...(data.emergencyName && { emergencyName: data.emergencyName.trim() }),
      nationality: data.nationality.trim(),
      sex: data.sex.trim(),
      address: data.address.trim(),
      postCode: data.postCode.trim(),
    };

    const response = await authAxiosInstance.post<{ id: string }>(endpoints.students.list, payload);
    return response;
  };

  const enrollStudent = async (studentId: string, data: { universityId: string; courseId: string; intakeId: string }) => {
    await authAxiosInstance.patch(endpoints.students.enroll(studentId), data);
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
      leadNumber: data.leadNo.trim(),
      firstName: data.fName.trim(),
      lastName: data.lName.trim(),
      dateOfBirth: formatDateToDDMMYYYY(new Date(data.dob)),
      email: data.email.trim().toLowerCase(),
      phonePrefix: '+91',
      phoneNumber: data.phoneNumber.trim(),
      ...(data.emergencyNumber && { emergencyNumber: data.emergencyNumber.trim() }),
      ...(data.emergencyName && { emergencyName: data.emergencyName.trim() }),
      nationality: data.nationality.trim(),
      sex: data.sex.trim(),
      address: data.address.trim(),
      postCode: data.postCode.trim(),
    };

    const response = await authAxiosInstance.patch<{ id: string }>(
      endpoints.students.details(currentStudent?.id || ''),
      payload
    );
    return response;
  };

  const onSubmit = handleSubmit(async (data: any) => {
    try {
      if (!currentStudent) {
        const response = await createStudents(data);
        const studentId = response.data.id;

        // If enrollment fields are provided, enroll the student
        if (data.universityId && data.courseId && data.intakeId && studentId) {
          await enrollStudent(studentId, {
            universityId: data.universityId,
            courseId: data.courseId,
            intakeId: data.intakeId,
          });
          toast.success('Student created and enrolled successfully!');
        } else {
          toast.success('Student created successfully!');
        }
        router.push(paths.dashboard.students.details(studentId));

      } else {
        await updateStudent(data);
        toast.success('Update success!');
        router.push(paths.dashboard.students.details(currentStudent.id));
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Operation failed!');
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
              <Field.Text name="leadNo" label="Lead Number" />
              <Field.Text name="fName" label="First Name" />
              <Field.Text name="lName" label="Last Name" />
              <Field.DatePicker name="dob" label="Date of Birth" maxDate={dayjs()} />
              <Field.Text name="email" label="Email Address" />
              <Field.CountrySelect
                name="nationality"
                label="Country"
                getValue="name"
                id="nationality"
              />
              <Field.Text
                name="phoneNumber"
                label="Phone Number"
                id="phoneNumber"
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
              <Field.Text
                name="emergencyNumber"
                label="Emergency Contact Number (Optional)"
                id="emergencyNumber"
              />
              <Field.Text
                name="emergencyName"
                label="Emergency Contact Name (Optional)"
                id="emergencyName"
              />
              <Field.Text name="postCode" label="Post Code" />
              <Field.Text name="address" label="Address" sx={{ gridColumn: 'span 2' }} />

              {/* Enrollment Fields */}
              <Typography variant="subtitle1" sx={{ gridColumn: 'span 2', mt: 2 }}>
                Enrollment Information 
              </Typography>
              
              <Field.Select
                name="universityId"
                label="University"
                sx={{ gridColumn: 'span 2' }}
                helperText={'Only universities that are associated to courses will be shown here.'}
              >
                {Array.from(
                  new Map(associations.map((item) => [item.universityId, item])).values()
                ).map((opt) => (
                  <MenuItem key={opt.universityId} value={opt.universityId}>
                    {opt.universityName}
                  </MenuItem>
                ))}
              </Field.Select>

              <Tooltip
                title={!watchUniversityId ? 'Select University first' : ''}
                disableHoverListener={!!watchUniversityId}
                placement="top-start"
              >
                <span style={{ gridColumn: 'span 2', display: 'block' }}>
                  <Field.Select
                    name="courseId"
                    label="Course"
                    fullWidth
                    disabled={!watchUniversityId}
                    helperText="Only courses associated to the selected university will be shown."
                  >
                    {associations
                      .filter((i) => i.universityId === watchUniversityId)
                      .map((opt) => (
                        <MenuItem key={opt.courseId} value={opt.courseId}>
                          {opt.courseName}
                        </MenuItem>
                      ))}
                  </Field.Select>
                </span>
              </Tooltip>

              <Field.Select name="intakeId" label="Intake" sx={{ gridColumn: 'span 2' }}>
                {intakes.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </MenuItem>
                ))}
              </Field.Select>
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
