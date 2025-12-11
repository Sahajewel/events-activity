import express from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.route";
import { EventRoutes } from "../modules/event/event.routes";
import { BookingRoutes } from "../modules/booking/booking.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { Stats } from "fs";
import { StatsRoutes } from "../modules/stats/stats.routes";
const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/events",
    route: EventRoutes,
  },
  {
    path: "/bookings",
    route: BookingRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/stats",
    route: StatsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
