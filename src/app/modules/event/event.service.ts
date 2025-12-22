import { EventStatus } from "@prisma/client";
import cloudinary from "../../shared/cloudinary";
import prisma from "../../shared/prisma";
import { PaginationOptions } from "../../shared/pagination";
import { calculatePagination } from "../../shared/calculatePagination";
import ApiError from "../../errors/ApiError";
import Pusher from "pusher";

interface EventFilters {
  type?: string;
  location?: string;
  status?: EventStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  joiningFee?: number;
}

const pusher = new Pusher({
  appId: "2093616",
  key: "1e585517d24cb8cf7fc4",
  secret: "e068e83e6e4de6500863",
  cluster: "ap3",
  useTLS: true,
});
export const createEvent = async (
  hostId: string,
  data: any,
  file?: Express.Multer.File
) => {
  let imageUrl: string | undefined = undefined;

  // Upload image if exists
  if (file) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "events-platform/events" }
    );
    imageUrl = result.secure_url;
  }

  const event = await prisma.event.create({
    data: {
      ...data,
      date: new Date(data.date),
      hostId,
      ...(imageUrl && { imageUrl }),
    },
    include: {
      host: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
    },
  });
  pusher.trigger("events-channel", "new-event", {
    title: "New Event Alert! 🔥",
    message: `${event.host.fullName} has created a new event: ${event.name}`,
    type: event.type,
    id: event.id,
  });
  return event;
};

export const getAllEvents = async (
  filters: EventFilters,
  options: PaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const where: any = {};

  if (filters.type) {
    where.type = { contains: filters.type, mode: "insensitive" };
  }

  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.date = {};
    if (filters.dateFrom) {
      where.date.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.date.lte = new Date(filters.dateTo);
    }
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    data: events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getEventById = async (eventId: string) => {
  const cleanedEventId = eventId.trim();
  console.log("Cleaned Id used for query", cleanedEventId);
  const event = await prisma.event.findUnique({
    where: { id: cleanedEventId },
    include: {
      host: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          bio: true,
          location: true,
          receivedReviews: {
            select: {
              rating: true,
            },
          },
        },
      },
      bookings: {
        where: { status: "CONFIRMED" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              fullName: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  // ============================
  // ⭐ CHECK EVENT COMPLETED LOGIC
  // ============================
  const now = new Date();
  if (event.date < now && event.status !== "COMPLETED") {
    await prisma.event.update({
      where: { id: cleanedEventId },
      data: { status: "COMPLETED" },
    });
    // Update all CONFIRMED bookings to COMPLETED
    await prisma.booking.updateMany({
      where: { eventId: cleanedEventId, status: "CONFIRMED" },
      data: { status: "COMPLETED" },
    });
    // update local object
    event.status = "COMPLETED";
  }
  // Calculate host average rating
  const hostRatings = event.host.receivedReviews;
  const hostAvgRating =
    hostRatings.length > 0
      ? hostRatings.reduce((sum, r) => sum + r.rating, 0) / hostRatings.length
      : 0;

  return {
    ...event,
    host: {
      ...event.host,
      averageRating: hostAvgRating.toFixed(1),
      receivedReviews: undefined,
    },
  };
};

// eventService.updateEvent

export const getMyHostedEvents = async (hostId: string) => {
  const events = await prisma.event.findMany({
    where: { hostId },
    orderBy: { date: "desc" },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  return events;
};
// DELETE EVENT SERVICE
export const deleteEvent = async (
  eventId: string,
  userId: string,
  role: string
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId.trim() },
  });

  if (!event) throw new ApiError(404, "Event not found");

  // ⭐ Logic: Admin holeo parbe, Host tar nijer event holeo parbe
  const isAdmin = role === "ADMIN";
  const isOwner = event.hostId === userId;

  if (!isAdmin && !isOwner) {
    throw new ApiError(403, "You do not have permission to delete this event");
  }

  await prisma.event.delete({ where: { id: event.id } });
  return { message: "Event deleted successfully" };
};

// UPDATE EVENT SERVICE
export const updateEvent = async (
  eventId: string,
  userId: string,
  role: string,
  data: any,
  file?: any
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) throw new ApiError(404, "Event not found");

  // ⭐ Same Logic: Admin OR Owner (Host) can update
  if (role !== "ADMIN" && event.hostId !== userId) {
    throw new ApiError(403, "You are not authorized to update this event");
  }

  // ... (Upload logic and prisma.update logic as you have it)
};
