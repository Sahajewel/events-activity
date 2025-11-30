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

export const updateEventSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    type: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)))
      .optional(),
    location: z.string().min(3).optional(),
    minParticipants: z.number().int().positive().optional(),
    maxParticipants: z.number().int().positive().optional(),
    joiningFee: z.number().nonnegative().optional(),
    status: z.enum(["OPEN", "FULL", "CANCELLED", "COMPLETED"]).optional(),
  }),
});
