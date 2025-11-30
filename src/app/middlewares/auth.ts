import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { verifyToken } from "../shared/jwt";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token =
        req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error("You are not authorized");
      }
      const verifyUser = verifyToken(token, config.jwt_secret as string);

      req.user = verifyUser;

      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new Error("You are not authorized");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
