import { EventStatus } from "@prisma/client";
import cloudinary from "../../shared/cloudinary";
import prisma from "../../shared/prisma";
import { PaginationOptions } from "../../shared/pagination";
import { calculatePagination } from "../../shared/calculatePagination";
import ApiError from "../../errors/ApiError";

interface EventFilters {
  type?: string;
  location?: string;
  status?: EventStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const createEvent = async (
  hostId: string,
  data: any,
  file?: Express.Multer.File
) => {
  let imageUrl = undefined;

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

export const updateEvent = async (
  eventId: string,
  hostId: string,
  data: any,
  file?: Express.Multer.File
) => {
  const cleanedEventId = eventId.trim();
  const event = await prisma.event.findUnique({
    where: { id: cleanedEventId },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.hostId !== hostId) {
    throw new ApiError(403, "You do not have permission to update this event");
  }

  let imageUrl = undefined;

  if (file) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "events-platform/events" }
    );
    imageUrl = result.secure_url;
  }

  try {
    const updatedEvent = await prisma.event.update({
      where: { id: cleanedEventId, hostId: hostId },
      data: {
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
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

    return updatedEvent;
  } catch (error: any) {
    // Jodi update operation P2025 error dei (mane record na pai),
    // tahole seta 404/403 hishebe handle korun.
    if (error.code === "P2025") {
      // Ekhane duto somvabona: ID bhul (404) ba Host ID bhul (403).
      // Sobcheye upojukto holo ownership error dewa, jodi ID check hoye thake.
      throw new ApiError(
        403,
        "Event not found or you do not have permission to update it."
      );
    }
    throw error; // Any other error
  }
};

export const deleteEvent = async (eventId: string, hostId: string) => {
  const cleanedEventId = eventId.trim();
  const event = await prisma.event.findUnique({
    where: { id: cleanedEventId },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.hostId !== hostId) {
    throw new ApiError(403, "You do not have permission to delete this event");
  }

  await prisma.event.delete({
    where: { id: cleanedEventId },
  });

  return { message: "Event deleted successfully" };
};

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
