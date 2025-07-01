import { toast } from 'sonner';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { z } from 'zod';

// Zod schema for request payload
export const paymentAssociationSchema = z.object({
  studentId: z.string(),
  // courseId: z.string(),
  paymentAmount: z.number().min(1, 'Payment amount must be greater than 0'),
  currency: z.string().min(1),
  paymentDate: z.string(), // ISO string format
  paymentStatus: z.enum(['pending', 'completed', 'failed']),
  // universityId: z.string(), // Assuming this is necessary as it was in course association
});

// TypeScript type inferred from Zod schema
export type PaymentAssociationPayload = z.infer<typeof paymentAssociationSchema>;

// Function to call the API for creating a payment association
export async function createPaymentAssociation(payload: PaymentAssociationPayload) {
  try {
    const response = await authAxiosInstance.post(endpoints.earnings.upsert, payload);
    return response;
  } catch (err) {
    console.error('Error:', err);
    toast.error('Error associating payment!');
    throw err;
  }
}
