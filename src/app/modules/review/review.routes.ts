import { Router } from "express";
import * as reviewController from "./review.controller";
import { createReviewSchema } from "./review.validation";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/",
  auth(),
  validate(createReviewSchema),
  reviewController.createReview
);
router.get("/public-testimonials", reviewController.getPublicTestimonials);
router.get("/event/:eventId", reviewController.getEventReviews);
router.get("/host/:hostId", reviewController.getHostReviews);

export const ReviewRoutes = router;
