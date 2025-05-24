import prisma from "../models/index.js";
import { findSeat, updateSeatStatus } from '../utils/bookingUtils.js';
import { confirmSeat, reserveSeat } from "./seatService.js";
import { validateBookableTrip } from "./tripService.js";



// ================================================ //
//                      CORE FEATURES               //
//================================================= //

const createBooking = async(bookingData, db = prisma) => {
    const booking = await db.booking.create({ data: bookingData })
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

const confirmBooking = async(db = prisma) => {
    const confirmed = await db.booking.update({
        where: { id: bookingId },
        data: { status: 'BOOKED' }
    })

    return confirmed;
}

// ================================================ //
//                      USER-FACING FEATURES       //
//================================================ //

const createBookingDraft = async(seatId, tripId) => {
    return await prisma.$transaction(async (tx) => {
        await validateBookableTrip(tripId, tx);
        await reserveSeat(tripId, seatId, tx);
        const bookingData = {seatId, tripId}
        const bookingDraft = await createBooking(bookingData, tx);
        // const
        return bookingDraft;
    })
}

const confirmBookingDraft = async() => {
    return prisma.$transaction( async(tx) => {
        await confirmBooking();
        await confirmSeat()
    })
}

export { 
    createBookingDraft, 
    listBooking,
    createBookingDraft,
    confirmBookingDraft,
}