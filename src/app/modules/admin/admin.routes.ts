import { Router } from "express";
import * as adminController from "./admin.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.use(auth("ADMIN"));

router.get("/dashboard", adminController.getDashboardStats);
router.patch("/users/:userId/role", adminController.updateUserRole);
router.patch("/users/:userId/toggle-status", adminController.toggleUserStatus);
router.delete("/users/:userId", adminController.deleteUser);
router.patch("/events/:eventId/status", adminController.updateEventStatus);

export const AdminRoutes = router;
