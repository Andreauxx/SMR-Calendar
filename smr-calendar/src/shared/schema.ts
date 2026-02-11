import { z } from "zod";

export const bookingRequestSchema = z.object({
  name: z.string().min(2, "Name is required"),
contact: z.string().min(7, "Contact number is required"),
messengerUrl: z.string().url().optional().or(z.literal("")),
  start: z.string().min(4),
  end: z.string().min(4),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
