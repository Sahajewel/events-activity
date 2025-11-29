import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err: any) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        next(
          new ApiError(
            400,
            "Validation failed",
            true,
            JSON.stringify(errorMessages)
          )
        );
      } else {
        next(error);
      }
    }
  };
};
