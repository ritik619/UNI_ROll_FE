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
import { createCourseAssociation, editCourseAssociation } from 'src/services/courses/attachCourses';
import { useCallback, useEffect, useState } from 'react';
import { fetchUniversities } from 'src/services/universities/fetchUniversities';
import { IUniversity } from 'src/types/university';
import { ICourseAssociation } from 'src/types/courseAssociation';

// ----------------------------------------------------------------------

const CourseAssociationSchema = zod.object({
  universityId: zod.string().min(1, 'University ID is required'),
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
    //  'upcoming', 'completed'
  ]),
});

type CourseAssociationFormType = zod.infer<typeof CourseAssociationSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  courseId: string;
  universities: IUniversity[];
  selectedAssociation?: ICourseAssociation | null;
  handleUpdateAssociation: (association: ICourseAssociation) => void

};

export function CourseQuickAssociationForm({ open, onClose, courseId, universities, selectedAssociation, handleUpdateAssociation }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  // const [universities, setUniversities] = useState<ICourse[]>([]);

  const defaultValues: CourseAssociationFormType = {
    universityId: '', // it was courseId
    // startDate: '',
    // endDate: '',
    // applicationDeadline: '',
    price: 0,
    currency: 'GBP',
    requirementsDescription: '',
    // languageOfInstruction: 'English',
    // maxStudents: 30,
    // availableSeats: 30,
    status: 'active',
  };

  const methods = useForm<CourseAssociationFormType>({
    mode: 'all',
    resolver: zodResolver(CourseAssociationSchema),
    defaultValues,
  });


  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    watch
  } = methods;

  useEffect(() => {
    if (selectedAssociation) {
      methods.reset({
        universityId: selectedAssociation.universityId,
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
    const selectedUniversity = universities.find((uni) => uni.id === data.universityId);
    const payload = {
      ...data,
      cityName: selectedUniversity?.cityName ?? '',
    };
    console.log(payload)
    if (selectedAssociation) {
      try {
        delete payload.universityId;
        // EDIT: 
        const {data} = await editCourseAssociation(selectedAssociation.id, payload);
        toast.success('University Association updated successfully!');
        handleUpdateAssociation({...data,id:selectedAssociation.id})

      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Failed to update university association');
      }
    } else {
      // CREATE
      payload.courseId = courseId;
      try {
        await createCourseAssociation(payload);
        router.refresh(); // or `router.push()` if needed
        toast.success('University association created successfully!');

      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Failed to create university association');
      }
    }
    router.refresh();
    onClose();
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>
        {selectedAssociation ? 'Edit University Association' : 'Associate a University with Course'}
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
                name="universityId"
                label="Universities"
                disabled={!!selectedAssociation}
                helperText="Select the universities offering"
              >
                {universities.map((university) => (
                  <MenuItem key={university.id} value={university.id}>
                    {university.name} ({university.cityName})
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
