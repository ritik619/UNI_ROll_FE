import type { IStudentsItem } from 'src/types/students';
import { gradeResultOptions, studentStatusOptions } from 'src/types/students';
import type { IIntake } from 'src/types/intake';
import type { ICourseAssociation } from 'src/types/courseAssociation';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

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
import { formatDateToMMDDYYYY, toDMY } from 'src/utils/format-date';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import { fetchIntakes } from 'src/services/Intakes/fetchIntakes';
import { fetchAssociations } from 'src/services/associations/fetchAssociations';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { uploadFileAndGetURL } from 'src/auth/context';
import { uuidv4 } from 'minimal-shared/utils';
import dayjs from 'dayjs';
import { CitySelect, CountrySelect } from 'src/components/select';
import { IUniversity } from 'src/types/university';
import { fetchUniversities } from 'src/services/universities/fetchUniversities';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export const NewStudentsSchema = zod.object({
  leadNo: zod.string().optional(),
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
  emergencyAddress: zod.string().optional(),
  emergencyEmail: zod.string().email('Invalid email').optional(),
  nationality: zod.string().min(1, { message: 'Nationality is required!' }),
  sex: zod.string().min(1, { message: 'Sex is required!' }),
  address: zod.string().optional(),
  postCode: zod.string().optional(),
  coverPhoto: zod.any().optional(),
  // Enrollment fields
  universityId: zod.string().optional(),
  courseId: zod.string().optional(),
  intakeId: zod.string().optional(),
  insuranceNumber: zod.string().optional(),
  notes: zod.string().optional(),
  highestQualification: zod
    .object({
      startDate: zod.string().optional(),
      endDate: zod.string().optional(),
      gradeResult: zod.string().optional(),
      institutionName: zod.string().optional(),
      countryOfIssue: zod.string().optional(),
    })
    .optional(),
  // status: zod.string(),
});

export type NewStudentsSchemaType = zod.infer<typeof NewStudentsSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentStudent?: IStudentsItem;
};

export function StudentsNewEditForm({ currentStudent }: Props) {
  const router = useRouter();
  const [associations, setAssociations] = useState<ICourseAssociation[]>([]);
  const [universities, setUniversities] = useState<IUniversity[]>([]);
  const [intakes, setIntakes] = useState<IIntake[]>([]);
  const [countryCode, setCountryCode] = useState('');
  const [cityId, setCityId] = useState('');
  const { user } = useAuthContext();
  const isRefferal = user?.isReferral ? user?.isReferral : false;
  const defaultValues: NewStudentsSchemaType = {
    leadNo: currentStudent?.leadNumber || '',
    fName: currentStudent?.firstName || '',
    lName: currentStudent?.lastName || '',
    email: currentStudent?.email || '',
    dob: currentStudent?.highestQualification?.startDate
      ? toDMY(currentStudent?.dateOfBirth).toDateString()
      : '',
    phoneNumber: currentStudent?.phoneNumber || '',
    emergencyNumber: currentStudent?.emergencyNumber || '',
    emergencyName: currentStudent?.emergencyName || '',
    emergencyAddress: currentStudent?.emergencyAddress || '',
    emergencyEmail: currentStudent?.emergencyEmail || '',
    nationality: currentStudent?.nationality || '',
    sex: currentStudent?.sex || '',
    address: currentStudent?.address || '',
    postCode: currentStudent?.postCode || '',
    coverPhoto: currentStudent?.coverPhoto,
    universityId: currentStudent?.universityId || '',
    courseId: currentStudent?.courseId || '',
    intakeId: currentStudent?.intakeId || '',
    notes: currentStudent?.notes || '',
    insuranceNumber: currentStudent?.insuranceNumber || '',
    highestQualification: {
      startDate: currentStudent?.highestQualification?.startDate
        ? toDMY(currentStudent?.highestQualification?.startDate).toDateString()
        : '',
      endDate: currentStudent?.highestQualification?.endDate
        ? toDMY(currentStudent?.highestQualification?.endDate).toDateString()
        : '',
      gradeResult: currentStudent?.highestQualification?.gradeResult || '',
      institutionName: currentStudent?.highestQualification?.institutionName || '',
      countryOfIssue: currentStudent?.highestQualification?.countryOfIssue || '',
    },
    // status: currentStudent?.status || '',
  };
  console.log(defaultValues);
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

  const getUniversities = async () => {
    try {
      const { universities: u } = await fetchUniversities('active', 0, 1000, cityId, countryCode); // Update this as per your service
      setUniversities(u);
    } catch (e) {
      console.error('Failed to fetch universities', e);
      toast.error('Failed to fetch universities');
      setUniversities([]);
    } finally {
      methods.setValue('universityId', '');
      methods.setValue('courseId', '');
    }
  };

  useEffect(() => {
    getUniversities();
  }, [countryCode, cityId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [associationsData, intakesData] = await Promise.all([
          fetchAssociations(
            'active',
            undefined,
            undefined,
            undefined,
            undefined,
            cityId,
            countryCode
          ),
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
  }, [countryCode]);

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
    const rawHQ = {
      ...(isValidDate(data?.highestQualification?.startDate) && {
        startDate: formatDateToMMDDYYYY(new Date(data?.highestQualification?.startDate)),
      }),
      ...(isValidDate(data?.highestQualification?.endDate) && {
        endDate: formatDateToMMDDYYYY(new Date(data?.highestQualification?.endDate)),
      }),
      ...(data?.highestQualification?.gradeResult && {
        gradeResult: data?.highestQualification?.gradeResult,
      }),
      ...(data?.highestQualification?.institutionName?.trim() && {
        institutionName: data?.highestQualification?.institutionName.trim(),
      }),
      ...(data?.highestQualification?.countryOfIssue?.trim() && {
        countryOfIssue: data?.highestQualification?.countryOfIssue.trim(),
      }),
    };
    const payload = {
      coverPhoto: data.coverPhoto,
      leadNumber: data.leadNo?.trim(),
      firstName: data.fName.trim(),
      lastName: data.lName.trim(),
      dateOfBirth: formatDateToMMDDYYYY(new Date(data.dob)),
      email: data.email.trim(),
      phonePrefix: '+91',
      phoneNumber: data.phoneNumber.trim(),
      ...(data.emergencyNumber && { emergencyNumber: data.emergencyNumber.trim() }),
      ...(data.emergencyName && { emergencyName: data.emergencyName.trim() }),
      ...(data.emergencyAddress && { emergencyAddress: data.emergencyAddress.trim() }),
      ...(data.emergencyEmail && { emergencyEmail: data.emergencyEmail.trim() }),
      nationality: data.nationality.trim(),
      sex: data.sex.trim(),
      address: data.address?.trim(),
      postCode: data.postCode?.trim(),
      notes: data.notes?.trim(),
      insuranceNumber: data.insuranceNumber?.trim(),
      ...(Object.keys(rawHQ).length > 0 && {
        highestQualification: rawHQ,
      }),
    };

    const response = await authAxiosInstance.post<{ id: string }>(endpoints.students.list, payload);
    return response;
  };
  function isValidDate(date: any): boolean {
    return new Date(date) instanceof Date && !isNaN(new Date(date).getTime());
  }

  const enrollStudent = async (
    studentId: string,
    data: {
      universityId: string;
      courseId: string;
      intakeId: string;
      //  status: string
    }
  ) => {
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
    const rawHQ = {
      ...(isValidDate(data?.highestQualification?.startDate) && {
        startDate: formatDateToMMDDYYYY(new Date(data?.highestQualification?.startDate)),
      }),
      ...(isValidDate(data?.highestQualification?.endDate) && {
        endDate: formatDateToMMDDYYYY(new Date(data?.highestQualification?.endDate)),
      }),
      ...(data?.highestQualification?.gradeResult && {
        gradeResult: data.highestQualification.gradeResult,
      }),
      ...(data?.highestQualification?.institutionName?.trim() && {
        institutionName: data.highestQualification.institutionName.trim(),
      }),
      ...(data?.highestQualification?.countryOfIssue?.trim() && {
        countryOfIssue: data.highestQualification.countryOfIssue.trim(),
      }),
    };
    const payload = {
      coverPhoto: data.coverPhoto,
      leadNumber: data.leadNo?.trim(),
      firstName: data.fName.trim(),
      lastName: data.lName.trim(),
      dateOfBirth: formatDateToMMDDYYYY(new Date(data.dob)),
      email: data.email.trim().toLowerCase(),
      phonePrefix: '+91',
      phoneNumber: data.phoneNumber.trim(),
      notes: data?.notes?.trim(),
      ...(data.emergencyNumber && { emergencyNumber: data.emergencyNumber.trim() }),
      ...(data.emergencyName && { emergencyName: data.emergencyName.trim() }),
      ...(data.emergencyAddress && { emergencyAddress: data.emergencyAddress.trim() }),
      ...(data.emergencyEmail && { emergencyEmail: data.emergencyEmail.trim() }),
      nationality: data.nationality.trim(),
      sex: data.sex.trim(),
      address: data.address?.trim(),
      postCode: data.postCode?.trim(),
      insuranceNumber: data.insuranceNumber?.trim(),
      ...(Object.keys(rawHQ).length > 0 && {
        highestQualification: rawHQ,
      }),
      // status: data.status,
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
        if (data.universityId && data.courseId && data.intakeId && studentId && !currentStudent) {
          await enrollStudent(studentId, {
            universityId: data.universityId,
            courseId: data.courseId,
            intakeId: data.intakeId,
            // status: data.status,
          });
          toast.success('Student created and enrolled successfully!');
        } else {
          toast.success('Student created successfully!');
        }
        if (isRefferal) {
          router.push(paths.dashboard.students.list);
        } else {
          router.push(paths.dashboard.students.details(studentId));
        }
      } else {
        await updateStudent(data);
        toast.success('Update success!');
        if (isRefferal) {
          router.push(paths.dashboard.students.list);
        } else {
          router.push(paths.dashboard.students.details(currentStudent.id));
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message);
    }
  });
  useEffect(() => {
    setCityId('');
  }, [countryCode]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* <Grid size={{ xs: 12, md: 3 }}>
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
        </Grid> */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Card sx={{ p: 3 }}>
            <Box>
              <Box
                sx={{
                  rowGap: 3,
                  columnGap: 2,
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
              >
                <Typography variant="subtitle1" sx={{ gridColumn: 'span 2', mt: 2 }}>
                  Student Profile
                </Typography>
                <Field.Text name="fName" label="First Name" />
                <Field.Text name="lName" label="Last Name" />
                <Field.DatePicker name="dob" label="Date of Birth" maxDate={dayjs()} />
                {!isRefferal && <Field.Text name="leadNo" label="Lead Number" />}
                <Field.Text name="phoneNumber" label="Phone Number" id="phoneNumber" />
                <Field.Text name="email" label="Email Address" />
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
                <Field.CountrySelect
                  name="nationality"
                  label="Nationality"
                  getValue="name"
                  id="nationality"
                />
                {isRefferal && <Field.Text name="notes" label="Notes" multiline />}

                {!isRefferal && (
                  <Field.Text name="address" label="Address" sx={{ gridColumn: 'span 2' }} />
                )}
                {!isRefferal && <Field.Text name="postCode" label="Post Code" />}
                {!isRefferal && (
                  <Field.Text name="insuranceNumber" label="National Insurance Number" />
                )}
              </Box>
              {!isRefferal && (
                <Box
                  sx={{
                    rowGap: 3,
                    columnGap: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ gridColumn: 'span 2', mt: 2 }}>
                    Highest Qualification
                  </Typography>
                  <Field.Text
                    name="highestQualification.institutionName"
                    label="Institution Name"
                  />
                  <Field.Select name="highestQualification.gradeResult" label="Grade Result">
                    {gradeResultOptions.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  <Field.DatePicker
                    name="highestQualification.startDate"
                    label="Start Date"
                    maxDate={dayjs()}
                  />
                  <Field.DatePicker
                    name="highestQualification.endDate"
                    label="End Date"
                    maxDate={dayjs()}
                  />
                  <Field.CountrySelect
                    name="highestQualification.countryOfIssue"
                    label="Country Of Issue"
                    getValue="name"
                    id="countryOfIssue"
                  />
                </Box>
              )}
              {!isRefferal && (
                <Box
                  sx={{
                    rowGap: 3,
                    columnGap: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ gridColumn: 'span 2', mt: 2 }}>
                    Emergency Contact
                  </Typography>
                  <Field.Text
                    name="emergencyName"
                    label="Emergency Name"
                    id="emergencyName"
                  />
                  <Field.Text
                    name="emergencyNumber"
                    label="Emergency Number"
                    id="emergencyNumber"
                  />
                  <Field.Text
                    name="emergencyAddress"
                    label="Emergency Address"
                    id="emergencyAddress"
                  />
                  <Field.Text
                    name="emergencyEmail"
                    label="Emergency Email"
                    id="emergencyEmail"
                  />
                </Box>
              )}
              {/* Enrollment Fields */}
              {!currentStudent && !isRefferal && (
                <Box
                  sx={{
                    rowGap: 3,
                    columnGap: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ gridColumn: 'span 2', mt: 2 }}>
                    Enrollment Information
                  </Typography>

                  <CountrySelect
                    id="country-id"
                    label="Country"
                    getValue="code"
                    placeholder="Choose a Country"
                    onChange={(event, newValue) => {
                      // Handle value change
                      setCountryCode(newValue);
                    }}
                  />
                  <CitySelect
                    id="city-id"
                    label="City"
                    getValue="cityId"
                    placeholder="Choose a City"
                    onChange={(event, newValue) => {
                      // Handle value change
                      setCityId(newValue);
                    }}
                    countryCode={countryCode}
                  />
                  <Tooltip
                    title={!countryCode ? 'Please select a country first' : ''}
                    disableHoverListener={!!countryCode}
                    placement="top-start"
                  >
                    <span style={{ gridColumn: 'span 1', display: 'block' }}>
                      <Field.Select
                        name="universityId"
                        label="University"
                        sx={{ gridColumn: 'span 2' }}
                        disabled={!countryCode}
                        helperText={
                          'Only universities that are associated to courses will be shown here.'
                        }
                      >
                        {Array.from(
                          new Map(universities.map((item) => [item.id, item])).values()
                        ).map((opt) => (
                          <MenuItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </MenuItem>
                        ))}
                      </Field.Select>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={!watchUniversityId ? 'Select University first' : ''}
                    disableHoverListener={!!watchUniversityId}
                    placement="top-start"
                  >
                    <span style={{ gridColumn: 'span 1', display: 'block' }}>
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
                  <Field.Select name="intakeId" label="Intake" sx={{ gridColumn: 'span 1' }}>
                    {intakes.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  {/* <Field.Select name="status" label="Status" sx={{ gridColumn: 'span 1' }}>
                    {studentStatusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Field.Select> */}
                </Box>
              )}
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
