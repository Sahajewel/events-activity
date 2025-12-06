import { Router } from "express";
import * as paymentController from "./payment.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/create-intent", auth(), paymentController.createPaymentIntent);
router.post("/confirm", auth(), paymentController.confirmPayment);
router.get("/history", auth(), paymentController.getPaymentHistory);
router.patch(
  "/:paymentIntentId",
  auth(),
  paymentController.updatePaymentStatus
);
export const PaymentRoutes = router;
