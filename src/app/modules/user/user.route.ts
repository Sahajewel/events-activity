import { Router } from "express";
import * as userController from "./user.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validateRequest";
import { updateProfileSchema } from "./user.validation";
import { upload } from "../../shared/upload";

const router = Router();

router.get("/", auth(Role.ADMIN), userController.getAllUsers);
router.get("/:id", userController.getUserProfile);
router.patch(
  "/profile",
  auth(),
  upload.single("profileImage"),
  validate(updateProfileSchema),
  userController.updateProfile
);

export const UserRoutes = router;
