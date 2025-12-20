import { Router } from "express";
import * as bookingController from "./booking.controller";
import { createBookingSchema } from "./booking.validation";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validateRequest";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/",
  auth(),
  validate(createBookingSchema),
  bookingController.createBooking
);

router.get("/my-bookings", auth(), bookingController.getUserBookings);
router.get(
  "/event/:eventId",
  auth(Role.HOST, Role.ADMIN),
  bookingController.getEventBookings
);
router.patch("/:id/cancel", auth(), bookingController.cancelBooking);
router.post("/validate-coupon", bookingController.validateCoupon);
export default router;
export const BookingRoutes = router;
