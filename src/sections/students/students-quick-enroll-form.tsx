import type { IIntake } from 'src/types/intake';
import type { ICourseAssociation } from 'src/types/courseAssociation';

import { z as zod } from 'zod';
import router from 'next/router';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { fetchIntakes } from 'src/services/Intakes/fetchIntakes';
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import { fetchAssociations } from 'src/services/associations/fetchAssociations';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { Tooltip } from '@mui/material';
import { IStudentsItem } from 'src/types/students';

// ----------------------------------------------------------------------

export const StudentQuickEnrollSchema = zod.object({
  universityId: zod.string().min(1, { message: 'Please select a university' }),
  courseId: zod.string().min(1, { message: 'Please select a course' }),
  intakeId: zod.string().min(1, { message: 'Please select an intake' }),
  status: zod.string().min(1, { message: 'Please select a status' }),
});

export type StudentQuickEnrollSchemaType = zod.infer<typeof StudentQuickEnrollSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  studentId: string;
  student: IStudentsItem;
  associations?: ICourseAssociation[];
  intakes?: IIntake[];
  onEnroll?: (
    data:IStudentsItem
  ) => void;
};

const STATUS_OPTIONS = [
  // { value: 'All', label: 'All' },
  { value: 'Enrolled', label: 'Enrolled' },
  { value: 'Withdrawn', label: 'Withdrawn' },
  { value: 'Deferred', label: 'Deferred' },
  { value: 'UnEnrolled', label: 'Un-Enrolled' },
  // { value: 'Unaffiliated', label: 'Un-Affiliated' },
];
export function StudentQuickEnrollForm({
  open,
  onClose,
  studentId,
  student,
  associations = [],
  intakes = [],
  onEnroll,
}: Props) {
  const defaultValues: StudentQuickEnrollSchemaType = {
    universityId: student?.universityId || '',
    courseId: student?.courseId || '',
    intakeId: student?.intakeId || '',
    status: student?.status || STATUS_OPTIONS[0].value,
  };

  const methods = useForm<StudentQuickEnrollSchemaType>({
    mode: 'all',
    resolver: zodResolver(StudentQuickEnrollSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;
  const watchUniversityId = watch('universityId');

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response=await authAxiosInstance.patch(endpoints.students.enroll(studentId), data);
      if (onEnroll) {
        onEnroll( response.data);
      }
      toast.success('Student enrolled successfully!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Enrollment failed!');
    }
  });
  const { setValue } = methods;

  useEffect(() => {
    const associatedCourses = associations.filter(
      (i) => i.universityId === watchUniversityId
    );
  
    const currentCourseId = methods.getValues('courseId');
    const stillValid = associatedCourses.some((c) => c.courseId === currentCourseId);
    if (!stillValid) {
      setValue('courseId', '');
    }
  }, [watchUniversityId, associations, methods, setValue]);

  useEffect(()=>{
    if(student?.universityId && student?.courseId){
      setValue('courseId',student?.courseId ?? '')
    }
  },[studentId])
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Enroll Student</DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
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
                  {opt.universityName} ({opt?.cityName ?? ''})
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
            <Field.Select name="status" label="Status" sx={{ gridColumn: 'span 2' }}>
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Enroll
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

