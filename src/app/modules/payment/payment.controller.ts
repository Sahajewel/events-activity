import { Request, Response } from "express";

import * as paymentService from "./payment.service";
import asyncHandler from "../../shared/asyncHandler";
import ApiResponse from "../../shared/apiResponse";
import prisma from "../../shared/prisma";

export const createPaymentIntent = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await paymentService.createPaymentIntent(
      req.body.bookingId,
      req.user!.id
    );
    res.json(
      new ApiResponse(200, result, "Payment intent created successfully")
    );
  }
);

export const confirmPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.confirmPayment(
      req.body.paymentIntentId
    );
    res.json(new ApiResponse(200, result, "Payment confirmed successfully"));
  }
);

export const getPaymentHistory = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const payments = await paymentService.getPaymentHistory(req.user!.id);
    res.json(
      new ApiResponse(200, payments, "Payment history fetched successfully")
    );
  }
);
// payment.controller.ts e add koro
export const updatePaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentIntentId } = req.params;

    const payment = await prisma.payment.update({
      where: { transactionId: paymentIntentId },
      data: { status: "COMPLETED" },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });

    res.json(new ApiResponse(200, payment, "Payment updated"));
  }
);

// payment.routes.ts e add koro
