import Stripe from "stripe";
import prisma from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import config from "../../../config";

const stripe = new Stripe(config.stripe_secret_key || "", {
  apiVersion: "2025-11-17.clover",
});

export const createPaymentIntent = async (
  bookingId: string,
  userId: string
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      event: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to pay for this booking"
    );
  }

  if (booking.status !== "PENDING") {
    throw new ApiError(400, "Booking is not pending payment");
  }

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.amount * 100), // Convert to cents
    currency: "bdt",
    metadata: {
      bookingId: booking.id,
      userId: userId,
      eventId: booking.eventId,
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: booking.amount,
      transactionId: paymentIntent.id,
      paymentMethod: "stripe",
      status: "PENDING",
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

export const confirmPayment = async (paymentIntentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: paymentIntentId },
    include: {
      booking: true,
    },
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  // Verify with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === "succeeded") {
    // Update payment and booking
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED" },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      }),
    ]);

    return { success: true, message: "Payment confirmed successfully" };
  }

  throw new ApiError(400, "Payment verification failed");
};

export const getPaymentHistory = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        userId,
      },
    },
    include: {
      booking: {
        include: {
          event: {
            select: {
              name: true,
              date: true,
              location: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments;
};
