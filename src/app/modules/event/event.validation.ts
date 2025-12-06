import { z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Event name must be at least 3 characters"),
    type: z.string().min(2, "Event type is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    location: z.string().min(3, "Location is required"),
    minParticipants: z.number().int().positive().optional(),
    maxParticipants: z.number().int().positive(),
    joiningFee: z.number().nonnegative().optional(),
  }),
});

// schemas/eventSchema.ts

// schemas/eventSchema.ts

// schemas/eventSchema.ts

export const updateEventSchema = z.object({
  name: z.string().min(3).optional(),
  type: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  date: z.string().datetime().optional(),
  location: z.string().min(3).optional(),
  status: z.enum(["OPEN", "FULL", "CANCELLED", "COMPLETED"]).optional(),

  // Ei 3ta line magic — empty string ke undefined kore dey → validation pass
  joiningFee: z.coerce
    .number()
    .min(0)
    .optional()
    .nullable()
    .transform((val) => val ?? null),
  maxParticipants: z.coerce.number().int().positive().optional(),
  minParticipants: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
    .transform((val) => (val === 0 || val === null ? null : val)), // 0/null = DB te null
});
