import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.uuid("Invalid event ID"),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
  }),
});
