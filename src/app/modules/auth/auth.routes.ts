import { Role } from "@prisma/client";

import { Router } from "express";
import * as authController from "./auth.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validateRequest";
import {
  changePasswordSchema,
  createUserValidationSchema,
  loginSchema,
} from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validate(createUserValidationSchema),
  authController.register
);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", auth(Role.ADMIN, Role.HOST, Role.USER), authController.getMe);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/refresh-token", authController.refreshToken);
router.patch(
  "/change-password",
  auth(Role.ADMIN, Role.HOST, Role.USER),
  validate(changePasswordSchema),
  // middleware.authenticate, // প্রমাণীকরণ (Authentication) মিডলওয়্যার যোগ করুন
  // validateRequest(AuthValidation.changePasswordSchema), // ভ্যালিডেশন মিডলওয়্যার যোগ করুন (যদি থাকে)
  authController.changePassword // আপনার কন্ট্রোলার ফাংশন
);
export const AuthRoutes = router;
