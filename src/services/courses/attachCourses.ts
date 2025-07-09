import { toast } from 'sonner';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { z } from 'zod';

// Zod schema for request payload
export const CourseAssociationSchema = z.object({
  courseId: z.string(),
  universityId: z.string(),
  startDate: z.string(), // ISO string format
  // endDate: z.string(),
  price: z.number(),
  currency: z.string().min(1),
  applicationDeadline: z.string(),
  requirementsDescription: z.string(),
  languageOfInstruction: z.string(),
  maxStudents: z.number().int().nonnegative(),
  availableSeats: z.number().int().nonnegative(),
  status: z.enum(['active', 'inactive']), // ✅ was: ['upcoming', 'ongoing', 'completed', 'cancelled']
});

// TypeScript type inferred from Zod schema
export type CourseAssociationPayload = z.infer<typeof CourseAssociationSchema>;

// Function to call the API

// Create a university-course association

export async function createCourseAssociation(payload: CourseAssociationPayload) {
  try {
    const response = await authAxiosInstance.post(endpoints.associations.root, payload);
    return response;
  } catch (err:any) {
    console.error('Error:', err);
    toast.error(err?.response?.data?.message || 'Failed to create university association.');
    throw err;
  }
}

// Edit an existing university-course association

export async function editCourseAssociation(id: string, payload: CourseAssociationPayload) {
  try {
    const response = await authAxiosInstance.patch(endpoints.associations.byAssociation(id), payload);
    return response;
  } catch (err: any) {
    console.error('Error:', err);
    toast.error(err?.response?.data?.message || 'Failed to update university association.');
    throw err;
  }
}