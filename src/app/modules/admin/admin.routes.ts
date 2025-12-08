// backend/src/app/modules/admin/admin.routes.ts

import { Router } from "express";
import * as adminController from "./admin.controller";
import auth from "../../middlewares/auth";

const router = Router();

// 💡 এডমিন প্রোটেকশন শুরু হওয়ার আগে এটি দিন
// যাতে সাধারণ USER এই রিকোয়েস্টটি পাঠাতে পারে
router.post("/host-requests", auth("USER"), adminController.sendHostRequest);

// 🚨 এখান থেকে নিচের সব রুট শুধুমাত্র ADMIN এর জন্য
router.use(auth("ADMIN"));

router.get("/dashboard", adminController.getDashboardStats);
router.patch("/users/:userId/role", adminController.updateUserRole);
router.patch("/users/:userId/toggle-status", adminController.toggleUserStatus);
router.delete("/users/:userId", adminController.deleteUser);
router.patch("/events/:eventId/status", adminController.updateEventStatus);

router.get("/host-requests", adminController.getAllHostRequests);
router.patch(
  "/host-requests/:requestId/approve",
  adminController.handleHostRequest
);

export const AdminRoutes = router;
