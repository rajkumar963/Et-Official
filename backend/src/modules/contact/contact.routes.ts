import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { contactSchema, type ContactMessage } from './contact.schema';
import { appendContactMessage } from './contact.service';

export function createContactRouter(
  save: (message: ContactMessage) => Promise<void> = appendContactMessage,
) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { message: 'Too many messages. Please try again in 15 minutes.' } },
  });

  router.post('/', limiter, async (req, res) => {
    const message = contactSchema.parse(req.body);
    await save(message);
    res
      .status(201)
      .json({ data: { message: 'Your message has been sent. We will get back to you by email.' } });
  });
  return router;
}

export const contactRouter = createContactRouter();
