import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Button,
  Dialog,
  MenuItem,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { createUniversityAssociation, editUniversityAssociation } from 'src/services/universities/attachUniversities';
import { useCallback, useEffect, useState } from 'react';
import { fetchCourses } from 'src/services/courses/fetchCourses';
import { ICourse } from 'src/types/course';
import { ICourseAssociation } from 'src/types/courseAssociation';
import { select } from 'src/theme/core/components/select';

// ----------------------------------------------------------------------

const UniversityAssociationSchema = zod.object({
  courseId: zod.string().min(1, 'Course ID is required'),
  // startDate: zod.string(),
  // endDate: zod.string(),
  // applicationDeadline: zod.string(),
  price: zod
    .union([zod.string(), zod.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Price is required'
    }),
  currency: zod.string().min(1),
  requirementsDescription: zod.string(),
  // languageOfInstruction: zod.string(),
  // maxStudents: zod.number().int().nonnegative(),
  // availableSeats: zod.number().int().nonnegative(),
  status: zod.enum(['active', 'inactive',
    // 'upcoming', 'completed'
  ]),
});

type UniversityAssociationFormType = zod.infer<typeof UniversityAssociationSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  universityId: string;
  courses: ICourse[];
  universityCity:string;
  selectedAssociation?: ICourseAssociation | null;
  handleUpdateAssociation: (association: ICourseAssociation) => void
};

export function UniversityQuickAssociationForm({ open, onClose, universityId, courses, selectedAssociation, handleUpdateAssociation,universityCity }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  // const [courses, setCourses] = useState<ICourse[]>([]);

  const defaultValues: UniversityAssociationFormType = {
    courseId: '',
    // startDate: '',
    // // endDate: '',
    // applicationDeadline: '',
    price: 0,
    currency: 'GBP',
    requirementsDescription: '',
    // languageOfInstruction: 'English',
    // maxStudents: 30,
    // availableSeats: 30,
    status: 'active',
  };

  const methods = useForm<UniversityAssociationFormType>({
    mode: 'all',
    resolver: zodResolver(UniversityAssociationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (selectedAssociation) {
      methods.reset({
        courseId: selectedAssociation.courseId,
        // startDate: selectedAssociation.startDate?.toString() || '',
        // applicationDeadline: selectedAssociation.applicationDeadline?.toString() || '',
        price: Number(selectedAssociation.price ?? 0),
        currency: selectedAssociation.currency ?? 'GBP',
        requirementsDescription: selectedAssociation.requirementsDescription ?? '',
        status:
          selectedAssociation.status === 'active' || selectedAssociation.status === 'inactive'
            ? selectedAssociation.status
            : 'inactive',
      });
    } else {
      methods.reset(defaultValues);
    }
  }, [selectedAssociation, methods.reset]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      ...data,
      cityName: universityCity,
    };
    if (selectedAssociation) {
      // EDIT mode
      try {
        delete payload.courseId;
        const { data } = await editUniversityAssociation(selectedAssociation.id, payload);
        toast.success('Course Association updated successfully!');
        handleUpdateAssociation({ ...data, id: selectedAssociation.id })
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Failed to update course association');
      }
    } else {
      // CREATE mode
      try {
        payload.universityId = universityId;
        await createUniversityAssociation(payload);
        toast.success('Course association created successfully!');
        router.refresh(); // or `router.push()` if needed

      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Failed to create course association');
      }
    }
    router.refresh();
    onClose();
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>
        {selectedAssociation ? 'Edit Course Association' : 'Associate a Course with University'}
      </DialogTitle>
      {!loading && (
        <Form methods={methods} onSubmit={onSubmit}>
          <DialogContent>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                py: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Select
                name="courseId"
                label="Courses"
                disabled={!!selectedAssociation}
                helperText="Select the courses offering"
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Text name="price" label="Price (e.g. 9500)" type="number" />
              {/* <Field.Text name="currency" label="Currency (e.g. USD)" /> */}
              {/* <Field.DatePicker name="startDate" label="Start Date" /> */}
              {/* <Field.DatePicker name="endDate" label="End Date" /> */}
              {/* <Field.DatePicker name="applicationDeadline" label="Application Deadline" /> */}
              {/* <Field.Text name="languageOfInstruction" label="Language" /> */}
              <Field.Text name="requirementsDescription" label="Requirements" multiline rows={2} />
              {/* <Field.Text name="maxStudents" label="Max Students" type="number" /> */}
              {/* <Field.Text name="availableSeats" label="Available Seats" type="number" /> */}
              <Field.Select name="status" label="Status">
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                {/* <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="completed">Completed</MenuItem> */}
              </Field.Select>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {selectedAssociation ? 'Update' : 'Create'}
            </LoadingButton>
          </DialogActions>
        </Form>
      )}
    </Dialog>
  );
}
