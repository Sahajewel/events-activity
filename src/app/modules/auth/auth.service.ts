import bcrypt from "bcryptjs";
import prisma from "../../shared/prisma";
import { generateToken } from "../../shared/jwt";
import ApiError from "../../errors/ApiError";

const accessSecret = process.env.ACCESS_TOKEN || "default_acces_token";
const refreshSecret = process.env.REFRESH_TOKEN || "default_refresh_secret";
export const register = async (data: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
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
      createdAt: true,
    },
  });

  const accessToken = generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessSecret,
    "1h"
  );
  const refreshToken = generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    refreshSecret,
    "7d"
  );

  return { user, accessToken, refreshToken };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessSecret,
    "1h"
  );
  const refreshToken = generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    refreshSecret,
    "7d"
  );
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const getProfile = async (userId: string) => {
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
      _count: {
        select: {
          hostedEvents: true,
          bookings: true,
          receivedReviews: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};
