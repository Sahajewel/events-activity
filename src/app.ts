import express, { Application, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import config from "./config";

import cookieParser from "cookie-parser";
// import { PaymentController } from "./app/modules/payment/payment.controller";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";

const app: Application = express();

// ⚠️ CRITICAL: Webhook MUST be before express.json()
// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   PaymentController.handleStripeWebHookEvent
// );

// Now other middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Server is running..",
    environment: config.node_env,
    uptime: process.uptime().toFixed(2) + " sec",
    timeStamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
