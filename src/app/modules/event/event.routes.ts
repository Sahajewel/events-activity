import { Router } from "express";
import * as eventController from "./event.controller";
import { createEventSchema, updateEventSchema } from "./event.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { upload } from "../../shared/upload";
import { validate } from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/",
  auth(Role.HOST, Role.ADMIN),
  upload.single("image"),
  validate(createEventSchema),
  eventController.createEvent
);

router.get("/", eventController.getAllEvents);
router.get(
  "/my-hosted",
  auth(Role.HOST, Role.ADMIN),
  eventController.getMyHostedEvents
);
router.get("/:id", eventController.getEventById);

router.patch(
  "/:id",
  auth(Role.HOST, Role.ADMIN),
  upload.single("image"),
  validate(updateEventSchema),
  eventController.updateEvent
);

router.delete("/:id", auth(Role.HOST, Role.ADMIN), eventController.deleteEvent);

export const EventRoutes = router;
