import { z } from "zod";

export const availabilityResponseSchema = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      start: z.string(),
      end: z.string().optional(),
      allDay: z.boolean().optional(),
      extendedProps: z
        .object({
          status: z.string().optional(),
        })
        .optional(),
    })
  ),
});

export const api = {
  availability: {
    list: {
      method: "GET" as const,
      path: "/api/availability",
      responses: {
        200: availabilityResponseSchema,
      },
    },
  },

  reserve: {
    create: {
      method: "POST" as const,
      path: "/api/reserve",
    },
  },
} as const;
