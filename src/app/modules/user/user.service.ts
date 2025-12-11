import { Role } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import { calculatePagination } from "../../shared/calculatePagination";
import cloudinary from "../../shared/cloudinary";
import { PaginationOptions } from "../../shared/pagination";
import prisma from "../../shared/prisma";

interface CalculatedPagination {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}
interface CustomPaginationOptions extends PaginationOptions {
  role?: Role;
  isActive?: string; // assuming UserRole is imported/defined
  // Add other filterable fields if needed (e.g., searchTerm, isActive)
}
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
          joiningFee: true,
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
              joiningFee: true,
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
  let interestsArray = undefined;

  if (file) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "events-platform/profiles" }
    );
    profileImageUrl = result.secure_url;
  }
  if (data.interests) {
    if (typeof data.interests === "string") {
      try {
        const parsedArray = JSON.parse(data.interests);
        if (Array.isArray(parsedArray)) {
          interestsArray = parsedArray;
        } // JSON parse kore alada variable-e rakhlam
      } catch (error) {
        interestsArray = []; // Invalid JSON hole empty array
      }
    } else if (Array.isArray(data.interests)) {
      interestsArray = data.interests; // Jodi already array hoy
    }
    // data object theke interests remove korun, karon amra niche alada kore update korbo
    delete data.interests;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      ...(interestsArray && { interests: interestsArray }),
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

// ... অন্যান্য সার্ভিস ফাংশন ...

// user.service.ts
// ... imports, getUserById, updateProfile ...

export const getAllUsers = async (options: CustomPaginationOptions) => {
  // 💡 ফিক্স: calculatePagination ফাংশন থেকে আসা ভ্যালুগুলো নিশ্চিতভাবে number/string হবে।
  // এটিকে CalculatedPagination টাইপে অ্যাসাইন করে দেওয়া হলো।
  const calculatedPagination = calculatePagination(
    options
  ) as CalculatedPagination;

  const { page, limit, skip, sortBy, sortOrder } = calculatedPagination;
  const { role, isActive } = options;

  const whereCondition: any = {};

  if (role) {
    whereCondition.role = role;
  }

  if (isActive !== undefined) {
    // 'true'/'false' স্ট্রিং থেকে বুলিয়ানে কনভার্ট করা হচ্ছে
    whereCondition.isActive = isActive === "true";
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip, // এখন নিশ্চিত number
      take: limit, // এখন নিশ্চিত number

      // 💡 ফিক্স: sortBy এখন নিশ্চিতভাবে string, তাই ব্যবহার করা যাবে
      orderBy: { [sortBy]: sortOrder },

      where: whereCondition,
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
    prisma.user.count({ where: whereCondition }),
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
