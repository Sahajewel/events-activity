// src/modules/booking/booking.controller.ts
import { Request, Response } from "express";
import * as bookingService from "./booking.service";
import asyncHandler from "../../shared/asyncHandler";
import ApiResponse from "../../shared/apiResponse";

export const createBooking = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, booking, "Booking created"));
  }
);

export const getUserBookings = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {
    const bookings = await bookingService.getUserBookings(req.user!.id);
    res.json(new ApiResponse(200, bookings, "Bookings fetched successfully"));
  }
);

export const getEventBookings = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {
    const bookings = await bookingService.getEventBookings(
      req.params.eventId,
      req.user!.id
    );
    res.json(
      new ApiResponse(200, bookings, "Event bookings fetched successfully")
    );
  }
);

export const cancelBooking = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user!.id
    );
    res.json(new ApiResponse(200, booking, "Booking cancelled successfully"));
  }
);

// ✅ New: Validate coupon endpoint
export const validateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, eventId, quantity } = req.body;

    const validation = await bookingService.validateCoupon(
      code,
      eventId,
      quantity || 1
    );

    res.json(new ApiResponse(200, validation, "Coupon validated successfully"));
  }
);
