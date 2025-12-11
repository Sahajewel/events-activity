import bcrypt from "bcryptjs";
import prisma from "../../shared/prisma";
import { generateToken, verifyToken } from "../../shared/jwt";
import ApiError from "../../errors/ApiError";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../shared/email";
import { addHours } from "date-fns";
import { User } from "@prisma/client";
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

// Email sender function (নিচে দেখাবো)
// তুই create করবি

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Security best practice: user না থাকলেও same message দেখাবো
  if (!user) {
    return { message: "If the email exists, a reset link has been sent." };
  }

  // Delete previous tokens
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  // Generate secure random token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(rawToken, 10);

  // Save token
  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt: addHours(new Date(), 1), // 1 hour expiry
    },
  });

  // Send email
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${email}`;

  await sendPasswordResetEmail(user.email, user.fullName || "User", resetLink);

  return { message: "If the email exists, a reset link has been sent." };
};

export const resetPassword = async (
  token: string,
  email: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset link");
  }

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetToken || !(await bcrypt.compare(token, resetToken.token))) {
    throw new ApiError(400, "Invalid or expired reset link");
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Delete the token after use
  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });
};
export const refreshToken = async (incomingRefreshToken: string) => {
  // 1. refreshToken ভেরিফাই করা (এক্সপায়ারি চেক করা)
  let decoded;
  try {
    // refreshSecret ব্যবহার করে টোকেন ডিকোড করা
    decoded = verifyToken(incomingRefreshToken, refreshSecret);
  } catch (error) {
    // টোকেন ইনভ্যালিড হলে বা মেয়াদ উত্তীর্ণ হলে এরর থ্রো করা
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // 2. টোকেনের payload থেকে ইউজার আইডি বের করা
  const userId = decoded.id;

  // 3. ডেটাবেস থেকে ইউজার চেক করা
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(401, "User associated with token not found");
  }

  // 4. নতুন accessToken তৈরি করা
  const newAccessToken = generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessSecret,
    "1h" // নতুন অ্যাকসেস টোকেনের মেয়াদ সেট করুন
  );

  // 5. নতুন টোকেন রিটার্ন করা
  return { accessToken: newAccessToken };
  // 💡 আপনি চাইলে নতুন refreshToken ও দিতে পারেন, তবে তা জটিলতা বাড়ায়
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<Partial<User>> => {
  // 1. ইউজারকে ডাটাবেস থেকে লোড করা (হ্যাশড পাসওয়ার্ড সহ)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true, // পাসওয়ার্ড হ্যাশ সিলেক্ট করা
    },
  });

  if (!user) {
    // যদি ইউজার না পাওয়া যায় (অসম্ভব হলেও, সেফটি)
    throw new Error("User not found"); // অথবা নতুন ApiError(404, 'User not found')
  }

  // 2. বর্তমান পাসওয়ার্ড যাচাই করা
  if (!user.password) {
    // যদি ইউজার সোশ্যাল লগইন হয় এবং পাসওয়ার্ড সেট না থাকে
    throw new Error("Password not set for this user account.");
  }

  const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordMatch) {
    // যদি বর্তমান পাসওয়ার্ড ভুল হয়
    // ⭐ এটিই সেই এরর যা ফ্রন্টএন্ডে toast.error হিসেবে যাবে
    throw new Error("Incorrect current password"); // অথবা নতুন ApiError(400, 'Incorrect current password')
  }

  // 3. নতুন পাসওয়ার্ড হ্যাশ করা
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // 4. ডাটাবেসে পাসওয়ার্ড আপডেট করা
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      // যদি আপনি JWT টোকেন ইস্যু বন্ধ করতে চান, তবে loggedInStatus: 'logout' সেট করতে পারেন
    },
    // নিরাপত্তার জন্য আপডেটের পর পাসওয়ার্ড হ্যাশ বাদ দিয়ে রিটার্ন করা
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      // অন্যান্য পাবলিক ফিল্ড...
    },
  });

  return updatedUser;
};
export const deactivateAccount = async (userId: string) => {
  // 1. ইউজারকে খুঁজে বের করা
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // যদি ইউজার ইতিমধ্যেই ডিঅ্যাক্টিভেট করা থাকে
  if (!user.isActive) {
    return { message: "Account is already deactivated." };
  }

  // 2. DataBase-এ isActive স্ট্যাটাস false করা
  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false, // ⭐ এটিই মূল লজিক যা ভবিষ্যতে লগইন ব্লক করবে
    },
  });

  // 3. টোকেন ইনভ্যালিডেশন (ঐচ্ছিক কিন্তু অত্যন্ত প্রস্তাবিত)
  // যদি আপনি রিফ্রেশ টোকেন ডাটাবেসে সেভ করে থাকেন, তবে তা ডিলিট করুন।
  // যেহেতু আপনি JWT ব্যবহার করছেন এবং সেটির কোনো ডাটাবেস রেকর্ড রাখেননি,
  // তাই নতুন করে কোনো টোকেন ইস্যু হবে না, তবে পুরনো টোকেনগুলি মেয়াদ শেষ না হওয়া পর্যন্ত বৈধ থাকতে পারে।
  // সিকিউরিটির জন্য, এই স্টেপটি নির্ভর করে আপনি কিভাবে টোকেন ম্যানেজ করেন।
  // সহজ উপায়: শুধু isActive: false সেট করুন, এবং login ফাংশন সেই চেকটি করবে।

  // 💡 টোকেন ইনভ্যালিডেশন এর জন্য যদি আপনার কোনো সেশন/টোকেন স্টোরেজ (যেমন Redis বা database token table) থাকে, তবে তা এখানে পরিষ্কার করতে হবে।
  // এই ডেমোতে ধরে নিচ্ছি, login ফাংশনে isActive চেক থাকার কারণে এটিই যথেষ্ট।

  return { message: "Account successfully deactivated." };
};
