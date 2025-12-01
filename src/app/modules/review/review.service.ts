import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

export const createReview = async (
  userId: string,
  eventId: string,
  rating: number,
  comment?: string
) => {
  // Check if event exists and is completed
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Check if user attended the event
  const booking = await prisma.booking.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (!booking) {
    throw new ApiError(400, "You can only review events you have attended");
  }

  const now = new Date();
  if (event.date < now && booking.status === "CONFIRMED") {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "COMPLETED" },
    });
    booking.status = "COMPLETED";
  }

  if (booking.status !== "COMPLETED") {
    throw new ApiError(400, "You can only review events you have attended");
  }

  // if (!booking || booking.status !== "COMPLETED") {
  //   throw new ApiError(400, "You can only review events you have attended");
  // }

  // ⭐ Auto-complete booking if event passed

  // Check if already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this event");
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      userId,
      hostId: event.hostId,
      eventId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          fullName: true,
          profileImage: true,
        },
      },
      event: {
        select: {
          name: true,
        },
      },
    },
  });

  return review;
};

export const getEventReviews = async (eventId: string) => {
  const reviews = await prisma.review.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          fullName: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    averageRating: avgRating.toFixed(1),
    totalReviews: reviews.length,
  };
};

export const getHostReviews = async (hostId: string) => {
  const reviews = await prisma.review.findMany({
    where: { hostId },
    include: {
      user: {
        select: {
          fullName: true,
          profileImage: true,
        },
      },
      event: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    averageRating: avgRating.toFixed(1),
    totalReviews: reviews.length,
  };
};
