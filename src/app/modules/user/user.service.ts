import { calculatePagination } from "../../shared/calculatePagination";
import cloudinary from "../../shared/cloudinary";
import { PaginationOptions } from "../../shared/pagination";
import prisma from "../../shared/prisma";

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      profileImage: true,
      bio: true,
      location: true,
      interests: true,
      createdAt: true,
      hostedEvents: {
        select: {
          id: true,
          name: true,
          type: true,
          date: true,
          location: true,
          imageUrl: true,
          status: true,
        },
        orderBy: { date: "desc" },
      },
      bookings: {
        select: {
          id: true,
          status: true,
          event: {
            select: {
              id: true,
              name: true,
              type: true,
              date: true,
              location: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      receivedReviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          user: {
            select: {
              fullName: true,
              profileImage: true,
            },
          },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Calculate average rating
  const avgRating =
    user.receivedReviews.length > 0
      ? user.receivedReviews.reduce((sum, review) => sum + review.rating, 0) /
        user.receivedReviews.length
      : 0;

  return { ...user, averageRating: avgRating.toFixed(1) };
};

export const updateProfile = async (
  userId: string,
  data: any,
  file?: Express.Multer.File
) => {
  let profileImageUrl = undefined;

  if (file) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "events-platform/profiles" }
    );
    profileImageUrl = result.secure_url;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      ...(profileImageUrl && { profileImage: profileImageUrl }),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      profileImage: true,
      bio: true,
      location: true,
      interests: true,
    },
  });

  return user;
};

export const getAllUsers = async (options: PaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        profileImage: true,
        location: true,
        interests: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
