import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    eventId: z.uuid("Invalid event ID"),
    rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
    comment: z
      .string()
      .min(10, "Comment must be at least 10 characters")
      .optional(),
  }),
});
