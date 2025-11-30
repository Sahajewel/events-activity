import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

export const createBooking = async (userId: string, eventId: string) => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { bookings: { where: { status: "CONFIRMED" } } },
      },
    },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.status !== "OPEN") {
    throw new ApiError(400, "Event is not available for booking");
  }

  if (event.hostId === userId) {
    throw new ApiError(400, "You cannot book your own event");
  }

  // Check if max participants reached
  if (event._count.bookings >= event.maxParticipants) {
    throw new ApiError(400, "Event is fully booked");
  }

  // Check if user already booked
  const existingBooking = await prisma.booking.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (existingBooking) {
    throw new ApiError(400, "You have already booked this event");
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId,
      eventId,
      amount: event.joiningFee,
      status: event.joiningFee > 0 ? "PENDING" : "CONFIRMED",
    },
    include: {
      event: {
        include: {
          host: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Update event status if fully booked
  const totalBookings = event._count.bookings + 1;
  if (totalBookings >= event.maxParticipants) {
    await prisma.event.update({
      where: { id: eventId },
      data: { status: "FULL" },
    });
  }

  return booking;
};

export const getUserBookings = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        include: {
          host: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  return bookings;
};

export const getEventBookings = async (eventId: string, hostId: string) => {
  // Verify host owns the event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.hostId !== hostId) {
    throw new ApiError(
      403,
      "You do not have permission to view these bookings"
    );
  }

  const bookings = await prisma.booking.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings;
};

export const cancelBooking = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to cancel this booking"
    );
  }

  if (booking.status === "CANCELLED") {
    throw new ApiError(400, "Booking is already cancelled");
  }

  // Update booking status
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  // Update event status if it was full
  if (booking.event.status === "FULL") {
    await prisma.event.update({
      where: { id: booking.eventId },
      data: { status: "OPEN" },
    });
  }

  return updatedBooking;
};
