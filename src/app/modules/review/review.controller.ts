import { Request, Response } from "express";
import * as reviewService from "./review.service";
import asyncHandler from "../../shared/asyncHandler";
import ApiResponse from "../../shared/apiResponse";

export const createReview = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {
    const { eventId, rating, comment } = req.body;
    console.log(req.body);
    const review = await reviewService.createReview(
      req.user!.id,
      eventId,
      rating,
      comment
    );
    res
      .status(201)
      .json(new ApiResponse(201, review, "Review created successfully"));
  }
);

export const getEventReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewService.getEventReviews(req.params.eventId);
    res.json(new ApiResponse(200, result, "Reviews fetched successfully"));
  }
);

export const getHostReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewService.getHostReviews(req.params.hostId);
    res.json(new ApiResponse(200, result, "Host reviews fetched successfully"));
  }
);
