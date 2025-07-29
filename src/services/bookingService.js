import prisma from "../models/index.js";
import { assignSeatsToBookingHelper, findSeat, releaseSeatsHelper, updateSeatStatus, validateSeatHold } from '../utils/bookingUtils.js';
import { confirmSeat, reserveSeat } from "./seatService.js";
import { validateBookableTrip } from "./tripService.js";
import { BookingStatus } from './../../prisma/src/generated/prisma/index.js';
import { generateUniqueBookingToken } from "../utils/bookingToken.js";
import { SEAT_HOLD_MS } from "../../config/booking.js";



// ================================================ //
//                      CORE FEATURES               //
//================================================= //

const createBooking = async(bookingData, db = prisma) => {
    const bookingToken = await generateUniqueBookingToken();
    const booking = await db.booking.create({ 
        data: {
            ...bookingData,
            bookingToken,
        },
     });

    return booking;
}

const getbookingByToken = async(bookingToken, db = prisma) => {
    const booking = await db.booking.findUnique({
        where: { bookingToken }
    })

    return booking;
}

const listBooking = async(
    { search, sort, page = 1, pageSize = 10 } = {},
    db = prisma
) => {
    const where = {};

    if (search) {
        if (search.status) where.status = search.status;
        if (search.tripId) where.tripId = search.tripId;
        if (search.bookingToken) where.bookingToken = search.bookingToken;
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const bookings = await db.booking.findMany({
        where,
        orderBy: sort || { createdAt: 'desc'},
        skip,
        take,
        include: {
            trip: {
                include: {
                    route: true,
                    bus: true,
                }
            },
            seat: true,
            payment: true,
        }
    });

    const total = await db.booking.count({ where });
    return {
        data: bookings,
        page,
        pageSize,
        total, 
        totalPages: Math.ceil(total / pageSize),
        hasNext: skip + take < total,
    }
}

const getAllBookings = async(
    { search, sort } = {},
    db = prisma
) => {
    const where = {};

    if (search) {
        if (search.status) where.status = search.status;
        if (search.tripId) where.tripId = search.tripId;
        if (search.bookingToken) where.bookingToken = search.bookingToken;
    }

    const bookings = await db.booking.findMany({
        where,
        orderBy: sort || { createdAt: 'desc'},
        include: {
            trip: {
                include: {
                    route: true,
                    bus: true,
                }
            },
            seat: true,
            payment: true,
        }
    });

    return bookings;
}

/**
 * Enhanced updateBookingService with automatic seat assignment logic
 * @param {string|number} identifier - booking token (string) or booking id (number)
 * @param {Object} updateData - data to update
 * @param {Object} options - additional options
 * @param {boolean} options.autoAssignSeats - whether to auto-assign seats when confirming
 * @param {number} options.requiredSeats - number of seats to assign (default: 1)
 * @param {Object} db - database client (for testing)
 * @returns {Object} - updated booking with seats
 */
const updateBookingService = async (identifier, updateData, options = {}, db = prisma) => {
  const { autoAssignSeats = true, requiredSeats = 1 } = options;
  
  const whereClause = typeof identifier === 'string'
    ? { bookingToken: identifier }
    : { id: identifier };

  // Avoid updating immutable fields explicitly
  const { id, bookingToken, createdAt, updatedAt, ...safeUpdateData } = updateData;

  // Use transaction to ensure data consistency
  return await db.$transaction(async (tx) => {
    
    // 1. First, get the current booking to check status changes
    const currentBooking = await tx.booking.findUnique({
      where: whereClause,
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          }
        },
        seat: true,
        payment: true,
      }
    });

    if (!currentBooking) {
      throw new Error(`Booking not found with identifier: ${JSON.stringify(identifier)}`);
    }

    // 2. Update the booking first
    const updatedBooking = await tx.booking.update({
      where: whereClause,
      data: safeUpdateData,   // Prisma updates updatedAt automatically
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          }
        },
        seat: true,
        payment: true,
      }
    });

    // 3. Handle status-based logic for seat assignment/release
    const oldStatus = currentBooking.status;
    const newStatus = updatedBooking.status;

    // Scenario 1: Booking is being confirmed and needs seat assignment
    if (autoAssignSeats && newStatus === 'CONFIRMED' && oldStatus !== 'CONFIRMED') {
      console.log(`Auto-assigning seats for confirmed booking: ${updatedBooking.bookingToken}`);
      
      try {
        const assignedSeats = await assignSeatsToBookingHelper(updatedBooking, requiredSeats, tx);
        console.log(`Successfully assigned seats: ${assignedSeats.join(', ')}`);
        
        // Create activity log for confirmation
        await tx.bookingLog.create({
          data: {
            bookingId: updatedBooking.id,
            action: 'BOOKING_CONFIRMED_BY_ADMIN',
            metadata: {
              previousStatus: oldStatus,
              newStatus: newStatus,
              assignedSeats: assignedSeats,
              autoAssigned: true
            }
          }
        });
        
      } catch (seatError) {
        console.error('Seat assignment failed:', seatError.message);
        // You can choose to either throw the error or continue without seats
        // For now, we'll throw to maintain data integrity
        throw new Error(`Booking confirmed but seat assignment failed: ${seatError.message}`);
      }
    }

    // Scenario 2: Booking is being cancelled - release seats
    if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      console.log(`Releasing seats for cancelled booking: ${updatedBooking.bookingToken}`);
      await releaseSeatsHelper(updatedBooking, tx);
      
      // Create activity log for cancellation
      await tx.bookingLog.create({
        data: {
          bookingId: updatedBooking.id,
          action: 'BOOKING_CANCELLED_BY_ADMIN',
          metadata: {
            previousStatus: oldStatus,
            newStatus: newStatus,
            seatsReleased: updatedBooking.seat ? updatedBooking.seat.length : 0
          }
        }
      });
    }

    // Scenario 3: Booking is being moved from confirmed to pending/draft - release seats
    if (oldStatus === 'CONFIRMED' && ['PENDING', 'DRAFT'].includes(newStatus)) {
      console.log(`Releasing seats for downgraded booking: ${updatedBooking.bookingToken}`);
      await releaseSeatsHelper(updatedBooking, tx);
      
      await tx.bookingLog.create({
        data: {
          bookingId: updatedBooking.id,
          action: 'BOOKING_STATUS_DOWNGRADED',
          metadata: {
            previousStatus: oldStatus,
            newStatus: newStatus,
            reason: 'Status changed from confirmed to pending/draft'
          }
        }
      });
    }

    // 4. Fetch the final updated booking with all relationships
    const finalBooking = await tx.booking.findUnique({
      where: whereClause,
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          }
        },
        seat: true,
        payment: true,
      }
    });

    return finalBooking;
  });
};

// ================================================ //
//                      USER-FACING FEATURES       //
//================================================ //

const createBookingDraft = async(draftPaylod) => {
    const { tripId, seatId, ...rest } = draftPaylod;

    return await prisma.$transaction(async (tx) => {
        await validateBookableTrip(tripId, tx);
        const bookingToken = await generateUniqueBookingToken();
        await reserveSeat({tripId, seatId, bookingToken}, tx);
        const bookingDraft = await tx.booking.create({
          data: {
            ...rest,
            tripId,
            status: BookingStatus.PENDING, // ← set your draft status
            bookingToken,
          },
        });
        // const
        return bookingDraft;
    })
}

/**
 * Confirms a PENDING booking: marks it CONFIRMED and attaches the seats.
 * @param {{ bookingId: number, seatIds: number[] }} params
 */
const confirmBookingDraft = async ({ bookingId, seatIds }, db = prisma) => {
  return await db.$transaction(async (tx) => {
    const now = new Date();
    const holdCutoff = new Date(now.getTime() - SEAT_HOLD_MS);

    if (!seatIds) {
      throw new Error("No seats provided");
    }
    // 1) Flip booking to CONFIRMED
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking) throw new Error("Booking not found");

    // If already confirmed, just return the booking
    if (booking.status === BookingStatus.CONFIRMED) {
      console.log("Booking already confirmed, skipping seat updates");
      return tx.booking.findUnique({
        where: { id: bookingId },
        include: { seat: true, trip: { include: { route: true, bus: true } } },
      });
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED }, // 
    });

    // console.log("SEAT IDS To Confimr:", seatIds)
    const seatsToUpdate = await tx.seat.findMany({
      where: { id: { in: seatIds } },
      select: { id: true, status: true, bookingId: true },
    });

    console.log("Seats before update:", seatsToUpdate);

    const updatedSeats = await tx.seat.updateMany({
      where: {
        id: { in: seatIds },
        status: "RESERVED",
        // reservedAt: { gte: holdCutoff },
        bookingId: null,
      },
      data: {
        status: "BOOKED",
        bookingId: bookingId,
      },
    });

    if (updatedSeats.count === 0) {
      throw new Error("No valid reserved seats found to confirm");
    }

    // 3) Return the fully wired booking
    return tx.booking.findUnique({
      where: { id: bookingId },
      include: { seat: true, trip: { include: { route: true, bus: true } } },
    });
  });
};

export const retrieveBooking = async (bookingToken) => {
    const booking = await prisma.booking.findUnique({
        where: { bookingToken },
        include: {
            trip: {
                include: {
                    route: true,
                    bus: true,
                },
            },
            payment: {
                where: { status: 'PAID' },
                orderBy: { createdAt: "desc"}
            }
        },
    })

    if (!booking) {
        throw new Error('Booking not found for you');
    }

    if (!booking.isPaymentComplete && !booking.isSplitPayment) {
        throw new Error('Payment not completed');
    }

    // For split payments, ensure some amount has been paid
    if (booking.isSplitPayment && booking.amountPaid <= 0) {
        throw new Error('No payment received for split payment booking');
    }

    if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
        throw new Error('Invalid booking status');
    }

    return booking;
}


export { 
    createBookingDraft, 
    listBooking,
    confirmBookingDraft,
    getbookingByToken,
    getAllBookings,
    updateBookingService,
}