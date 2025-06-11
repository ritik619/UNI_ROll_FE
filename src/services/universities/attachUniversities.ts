import { toast } from 'sonner';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { z } from 'zod';

// Zod schema for request payload
export const UniversityAssociationSchema = z.object({
  courseId: z.string(),
  universityId: z.string(),
  startDate: z.string(), // ISO string format
  // endDate: z.string(),
  price: z.number(),
  currency: z.string().min(1),
  applicationDeadline: z.string(),
  requirementsDescription: z.string(),
  // languageOfInstruction: z.string(),
  // maxStudents: z.number().int().nonnegative(),
  // availableSeats: z.number().int().nonnegative(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']), // Update as needed
});

// TypeScript type inferred from Zod schema
export type UniversityAssociationPayload = z.infer<typeof UniversityAssociationSchema>;

// Function to call the API
export async function createUniversityAssociation(payload: UniversityAssociationPayload) {
  try {
    const response = await authAxiosInstance.post(endpoints.associations.root, payload);
    return response;
  } catch (err) {
    console.error('Error:', err);
    toast.error('Error associating!');
    throw err;
  }
}
