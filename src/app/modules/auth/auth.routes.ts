import { Role } from "@prisma/client";

import { Router } from "express";
import * as authController from "./auth.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validateRequest";
import { createUserValidationSchema, loginSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validate(createUserValidationSchema),
  authController.register
);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", auth(Role.ADMIN, Role.HOST, Role.USER), authController.getMe);

export const AuthRoutes = router;
