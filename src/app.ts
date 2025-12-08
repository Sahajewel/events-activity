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
    // origin: "https://events-frontend-lake.vercel.app",
    credentials: true,
  })
);
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://events-frontend-lake.vercel.app"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200); // Prevent preflight error
//   }

//   next();
// });

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
