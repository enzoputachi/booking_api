import prisma from "../models/index.js";
import { findSeat, updateSeatStatus } from '../utils/bookingUtils.js';
import { confirmSeat, reserveSeat } from "./seatService.js";
import { validateBookableTrip } from "./tripService.js";
import { BookingStatus } from './../../prisma/src/generated/prisma/index.js';
import { generateUniqueBookingToken } from "../utils/bookingToken.js";



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
    // 1) Flip booking to CONFIRMED
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });

    // 2) Flip seats to BOOKED and write bookingId
    const now = new Date();
    const holdCutoff = new Date(now.getTime() - 5 * 60_000);

    const { count } = await tx.seat.updateMany({
      where: {
        id: { in: seatIds },
        status: "RESERVED",
        reservedAt: { gte: holdCutoff },
      },
      data: {
        status: "BOOKED",
        bookingId: bookingId,
      },
    });

    if (count !== seatIds.length) {
      throw new Error("Hold expired on one or more seats—please retry.");
    }

    // 3) Return the fully wired booking
    return tx.booking.findUnique({
      where: { id: bookingId },
      include: { seat: true, trip: { include: { route: true, bus: true } } },
    });
  });
};



export { 
    createBookingDraft, 
    listBooking,
    confirmBookingDraft,
    getbookingByToken,
}