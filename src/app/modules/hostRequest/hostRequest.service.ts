// backend/src/app/modules/hostRequest/hostRequest.service.ts

import prisma from "../../shared/prisma";
import ApiError from "../../errors/ApiError";

// ১. ইউজার হোস্ট হওয়ার রিকোয়েস্ট পাঠাবে
export const sendHostRequest = async (userId: string, message: string) => {
  const existingRequest = await prisma.hostRequest.findUnique({
    where: { userId },
  });

  if (existingRequest && existingRequest.status === "PENDING") {
    throw new ApiError(400, "You already have a pending request.");
  }

  return await prisma.hostRequest.upsert({
    where: { userId },
    update: { status: "PENDING", message },
    create: { userId, message },
  });
};

// ২. অ্যাডমিন রিকোয়েস্ট অ্যাপ্রুভ করবে (Role change logic)
export const approveHostRequest = async (requestId: string) => {
  const request = await prisma.hostRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!request) throw new ApiError(404, "Request not found");

  // Transaction ব্যবহার করছি যাতে দুটোই একসাথে সফল হয়
  return await prisma.$transaction(async (tx) => {
    // ইউজারের রোল আপডেট
    await tx.user.update({
      where: { id: request.userId },
      data: { role: "HOST" },
    });

    // রিকোয়েস্ট ডিলিট বা স্ট্যাটাস আপডেট
    return await tx.hostRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });
  });
};
