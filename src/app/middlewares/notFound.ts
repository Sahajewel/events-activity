import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Api not found",
    error: {
      path: req.originalUrl,
      message: "Your Request path is not found",
    },
  });
};

export default notFound;
