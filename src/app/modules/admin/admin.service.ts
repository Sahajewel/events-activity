import { Role } from "@prisma/client";
import prisma from "../../shared/prisma";
import ApiError from "../../errors/ApiError";

export const getDashboardStats = async () => {
  const [totalUsers, totalHosts, totalEvents, totalBookings, totalRevenue] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "HOST" } }),
      prisma.event.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

  // Recent activities
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true } },
      event: { select: { name: true } },
    },
  });

  const recentEvents = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      host: { select: { fullName: true } },
    },
  });

  return {
    stats: {
      totalUsers,
      totalHosts,
      totalEvents,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
    },
    recentBookings,
    recentEvents,
  };
};

export const updateUserRole = async (userId: string, role: Role) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });

  return updatedUser;
};

export const toggleUserStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });

  return updatedUser;
};

export const deleteUser = async (userId: string) => {
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "User deleted successfully" };
};

export const updateEventStatus = async (eventId: string, status: string) => {
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status: status as any },
  });

  return event;
};
