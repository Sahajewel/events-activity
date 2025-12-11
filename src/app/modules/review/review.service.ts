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
// review.service.ts এর getTopReviews ফাংশনটি আপডেট করুন

export const getTopReviews = async (limit: number) => {
  // 💡 আপনার সার্ভার কনসোলে লগ করে দেখুন এই ফাংশনটি কল হচ্ছে কি না
  console.log(`Fetching top ${limit} reviews...`);

  try {
    const reviews = await prisma.review.findMany({
      take: limit,
      // ⭐ সমাধান: orderBy কে সহজ করে শুধুমাত্র rating এবং createdAt ব্যবহার করুন
      orderBy: [
        { rating: "desc" }, // রেটিং সর্বোচ্চ
        { createdAt: "desc" }, // তারপর নতুন রিভিউ আগে
      ],

      // ⭐ আপনার মডেলে থাকা User এবং Event মডেলের সাথে সম্পর্ক ঠিক থাকতে হবে
      include: {
        user: {
          select: {
            id: true, // আইডি যুক্ত করুন যাতে রিলেশন ঠিক থাকে
            fullName: true,
            profileImage: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`Successfully fetched ${reviews.length} reviews.`);
    return reviews;
  } catch (error) {
    // 🚨 এররটি কনসোলে স্পষ্টভাবে দেখাবে
    console.error("❌ CRITICAL PRISMA ERROR (getTopReviews):", error);
    // আপনি চাইলে এখানে একটি জেনেরিক এরর হ্যান্ডেল করতে পারেন
    // throw new ApiError(500, "Internal server error fetching testimonials.");
    throw error; // যাতে asyncHandler এটি ধরে 500 এরর দেয়
  }
};
