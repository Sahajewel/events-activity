// src/app/middlewares/auth.ts (চূড়ান্ত সংশোধিত কোড)

import { NextFunction, Request, Response } from "express";
// import config from "../../config";
import { verifyToken } from "../shared/jwt";
import { Role } from "@prisma/client";

// 💡 Auth মিডলওয়্যারে টাইপ ডেফিনিশন (req.user এর জন্য)
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

const auth = (...roles: string[]) => {
  return async (
    req: AuthRequest, // ✅ সংশোধিত টাইপ ব্যবহার করা হলো
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1. Authorization Header টি সংগ্রহ করুন
      const authHeader = req.headers.authorization;

      // Header না থাকলে বা "Bearer " দিয়ে শুরু না হলে
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authorization failed: Token format is invalid.",
        });
      }

      // 2. টোকেনটিকে "Bearer " অংশটি বাদ দিয়ে এক্সট্র্যাক্ট করুন
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authorization failed: Token is missing.",
        });
      }

      // 3. টোকেন ভেরিফাই করুন
      // ⚠️ IMPORTANT: নিশ্চিত করুন config.access_token এ প্রোডাকশন Secret আছে
      const verifyUser = verifyToken(token, process.env.ACCESS_TOKEN as string);
      req.user = verifyUser as AuthRequest["user"]; // req.user এ Payload যুক্ত করা

      // 4. Role চেক (যদি থাকে)
      if (roles.length && !roles.includes(verifyUser.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have the required permission.",
        });
      }

      next();
    } catch (err: any) {
      // টোকেন মেয়াদোত্তীর্ণ হলে বা সিগনেচার ভুল হলে
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        // ⭐ ডিবাগিং এর জন্য এরর মেসেজ দিন (প্রোডাকশনে এই অংশটি বাদ দেওয়া যেতে পারে)
        // error: err.message,
      });
    }
  };
};

export default auth;
