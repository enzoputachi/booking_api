import prisma from "../models/index.js";
import { findSeat, updateSeatStatus, validateSeatHold } from '../utils/bookingUtils.js';
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

const confirmBooking = async(bookingId, db = prisma) => {
    const confirmed = await db.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED }
    })

    return confirmed;
}

// ================================================ //
//                      USER-FACING FEATURES       //
//================================================ //

const createBookingDraft = async(draftPaylod) => {
    const { tripId, seatId, ...rest } = draftPaylod;

    return await prisma.$transaction(async (tx) => {
        await validateBookableTrip(tripId, tx);
        await reserveSeat({tripId, seatId}, tx);
        const bookingDraft = await tx.booking.create({
          data: {
            ...rest,
            tripId,
            status: BookingStatus.PENDING, // ← set your draft status
            bookingToken: await generateUniqueBookingToken(),
          },
        });
        // const
        return bookingDraft;
    })
}

// const confirmBookingDraft = async({bookingId, seatIds}, db = prisma) => {

//     return db.$transaction( async(tx) => {
//         await confirmBooking(bookingId, tx);
//         await confirmSeat(seatIds, tx)
//     })
// }

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

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
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
        reservedAt: { gte: holdCutoff },
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

}