import { z } from 'zod';

export const shareSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
