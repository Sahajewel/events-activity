// src/modules/booking/booking.service.ts
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

interface CreateBookingData {
  eventId: string;
  quantity?: number;
  couponCode?: string;
}

export const createBooking = async (
  userId: string,
  data: CreateBookingData
) => {
  const { eventId, quantity = 1, couponCode } = data;

  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      bookings: {
        where: { status: { in: ["CONFIRMED", "PENDING"] } },
      },
    },
  });

  if (!event) throw new ApiError(404, "Event not found");
  if (event.status !== "OPEN")
    throw new ApiError(400, "Event is not available");
  if (event.hostId === userId)
    throw new ApiError(400, "You cannot book your own event");

  const totalBookedSeats = event.bookings.reduce(
    (sum, b) => sum + (b.quantity || 1),
    0
  );

  const spotsLeft = event.maxParticipants - totalBookedSeats;

  if (quantity > spotsLeft) {
    throw new ApiError(
      400,
      `Only ${spotsLeft} seat(s) left. Requested ${quantity}`
    );
  }

  const existingBooking = await prisma.booking.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (existingBooking) {
    throw new ApiError(400, "Already booked this event");
  }

  const subtotal = event.joiningFee * quantity;
  let discount = 0;
  let couponId: string | null = null;
  let couponCodeApplied: string | null = null;

  return await prisma.$transaction(async (tx) => {
    // ✅ Coupon validation INSIDE transaction
    if (couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (!coupon) throw new ApiError(400, "Invalid coupon");
      if (!coupon.isActive) throw new ApiError(400, "Coupon inactive");
      if (coupon.expiresAt && new Date() > coupon.expiresAt)
        throw new ApiError(400, "Coupon expired");
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
        throw new ApiError(400, "Coupon limit reached");
      if (subtotal < coupon.minAmount)
        throw new ApiError(400, `Minimum ₹${coupon.minAmount} required`);

      discount =
        coupon.type === "PERCENTAGE"
          ? (subtotal * coupon.discount) / 100
          : coupon.discount;

      discount = Math.min(discount, subtotal);

      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });

      couponId = coupon.id;
      couponCodeApplied = coupon.code;
    }

    const finalAmount = Math.max(0, subtotal - discount);

    const booking = await tx.booking.create({
      data: {
        userId,
        eventId,
        quantity,
        subtotal,
        discount,
        amount: finalAmount,
        couponCode: couponCodeApplied,
        status: finalAmount > 0 ? "PENDING" : "CONFIRMED",
      },
    });

    const newTotal = totalBookedSeats + quantity;

    if (newTotal >= event.maxParticipants) {
      await tx.event.update({
        where: { id: eventId },
        data: { status: "FULL" },
      });
    }

    return booking;
  });
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

  // ✅ Update booking status with transaction
  const updatedBooking = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    // Refund coupon usage if applicable
    if (booking.couponCode) {
      await tx.coupon.update({
        where: { code: booking.couponCode },
        data: { usedCount: { decrement: 1 } },
      });
    }

    // Update event status if it was full
    if (booking.event.status === "FULL") {
      await tx.event.update({
        where: { id: booking.eventId },
        data: { status: "OPEN" },
      });
    }

    return cancelled;
  });

  return updatedBooking;
};

// ✅ New: Validate coupon
// src/modules/booking/booking.service.ts

export const validateCoupon = async (
  code: string,
  eventId: string,
  quantity: number
) => {
  if (quantity < 1) throw new ApiError(400, "Invalid quantity");

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) throw new ApiError(404, "Coupon not found");
  if (!coupon.isActive) throw new ApiError(400, "Inactive coupon");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event not found");

  const subtotal = event.joiningFee * quantity;

  if (subtotal < coupon.minAmount)
    throw new ApiError(
      400,
      `Minimum ₹${coupon.minAmount} required for this coupon`
    );

  const discount =
    coupon.type === "PERCENTAGE"
      ? (subtotal * coupon.discount) / 100
      : coupon.discount;

  const finalDiscount = Math.min(discount, subtotal);

  // ✅ return e coupon data add kora holo jate frontend error na khay
  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
    },
    subtotal,
    discount: finalDiscount,
    finalAmount: subtotal - finalDiscount,
  };
};
