// import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../generated/client";
import ApiError from "../errors/ApiError";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong";
  let error = err;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    error = { statusCode: err.statusCode, isOperational: err.isOperational };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      message = "Duplicate key error";
      error = err.meta;
      statusCode = httpStatus.CONFLICT;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    message = "Validation error";
    error = err.message;
    statusCode = httpStatus.BAD_REQUEST;
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Unknown Prisma error occured";
    error = err.message;
    statusCode = httpStatus.BAD_REQUEST;
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    message = "Prisma client failed to initialize";
    error = err.message;
    statusCode = httpStatus.BAD_REQUEST;
  } else if (err instanceof ZodError) {
    message = "Zod error occured";

    // শুধুমাত্র message এর array বানাই
    const zodErr = err as ZodError<any>;
    error = zodErr.issues.map((e) => e.message).join(","); // সব message একসাথে comma দিয়ে

    statusCode = httpStatus.BAD_REQUEST;
  }

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
