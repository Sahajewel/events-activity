import express from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.route";
import { EventRoutes } from "../modules/event/event.routes";
import { BookingRoutes } from "../modules/booking/booking.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/event",
    route: EventRoutes,
  },
  {
    path: "/booking",
    route: BookingRoutes,
  },
  {
    path: "/review",
    route: ReviewRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
