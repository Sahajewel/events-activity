import { Request, Response } from "express";
import * as eventService from "./event.service";
import asyncHandler from "../../shared/asyncHandler";
import ApiResponse from "../../shared/apiResponse";
import ApiError from "../../errors/ApiError";

export const createEvent = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const event = await eventService.createEvent(
      req.user!.id,
      req.body,
      req.file
    );
    res
      .status(201)
      .json(new ApiResponse(201, event, "Event created successfully"));
  }
);

export const getAllEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await eventService.getAllEvents(req.query, req.query);
    res.json(new ApiResponse(200, result, "Events fetched successfully"));
  }
);

export const getEventById = asyncHandler(
  async (req: Request, res: Response) => {
    const eventIdFromParams = req.params.id;
    const event = await eventService.getEventById(eventIdFromParams);
    res.json(new ApiResponse(200, event, "Event fetched successfully"));
  }
);

// eventController.ts
// eventController.ts → updateEvent
export const updateEvent = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;

    // Multer + FormData → sob kichu req.body te ache (string)
    // z.coerce korbe number e
    const updateData = req.body;

    const updatedEvent = await eventService.updateEvent(
      id,
      req.user!.id,
      updateData,
      req.file // image
    );

    res.json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
  }
);
export const deleteEvent = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {
    const result = await eventService.deleteEvent(req.params.id, req.user!.id);
    res.json(new ApiResponse(200, result, "Event deleted successfully"));
  }
);

export const getMyHostedEvents = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {
    const events = await eventService.getMyHostedEvents(req.user!.id);
    res.json(
      new ApiResponse(200, events, "Hosted events fetched successfully")
    );
  }
);
