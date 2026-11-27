import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(100),
  email: z.string().trim().max(254).pipe(z.email()),
  topic: z.enum(['Journal support', 'Courses', 'E-books', 'Something else']),
  message: z.string().trim().min(10, 'Please include a little more detail.').max(5000),
});

export type ContactMessage = z.infer<typeof contactSchema>;
