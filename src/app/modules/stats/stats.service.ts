import prisma from "../../shared/prisma";

export const getPublicStats = async () => {
  // 🔥 Parallel queries for better performance
  const [
    totalUsers,
    totalHosts,
    totalEvents,
    totalBookings,
    totalRevenue,
    publishedEvents,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "USER",
        isActive: true, // শুধু active users
      },
    }),
    prisma.user.count({
      where: {
        role: "HOST",
        isActive: true,
      },
    }),
    prisma.event.count({
      where: {
        // শুধু published events count করবে
        status: "OPEN", // অথবা যেটা তোমার schema তে আছে
      },
    }),
    prisma.booking.count({
      where: {
        status: "CONFIRMED",
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    }),
    // Future events count (optional)
    prisma.event.count({
      where: {
        date: {
          gte: new Date(), // future events only
        },
      },
    }),
  ]);

  return {
    totalUsers,
    totalHosts,
    totalEvents,
    totalBookings,
    totalRevenue: totalRevenue._sum.amount || 0,
    upcomingEvents: publishedEvents,
  };
};
