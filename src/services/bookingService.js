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

const listBooking = async(db = prisma) => {
    try {
        const bookings = await db.booking.findMany()
        return bookings;
    } catch (error) {
        console.error("Failed to list booking:", error.message)
        throw error;
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
        const bookingData = {
            ...rest,
            tripId,
            seat: {
                connect: Array.isArray(seatId) ? seatId.map(id => ({ id })) : { id: seatId }
            }
        }
        const bookingDraft = await createBooking(bookingData, tx);
        // const
        return bookingDraft;
    })
}

const confirmBookingDraft = async({bookingId, seat}, db = prisma) => {

    return db.$transaction( async(tx) => {
        await confirmBooking(bookingId, tx);
        await confirmSeat(seat, tx)
    })
}



export { 
    createBookingDraft, 
    listBooking,
    confirmBookingDraft,
    getbookingByToken,
}