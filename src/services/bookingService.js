import prisma from "../models/index.js";
import { findSeat, updateSeatStatus } from './../utils/bookingUtils.js';


const createBooking = async(userId, tripId, seatNo) => {
    try {
        return prisma.$transaction(async tx => {

            // Find the seat
            const seat = await findSeat(tx, tripId, seatNo);
            if (!seat) throw new Error('Seat not avaialable');

            // update the seat status
            await updateSeatStatus(tx, seat.id);

            // create 
            return tx.booking.create({ data: {userId, tripId, seatId: seat.id} })
        })
    } catch (error) {
        console.error("Booking creation failed:", error.message);
        throw error;        
    }
}

const listBooking = async() => {
    try {
        const bookings = await prisma.booking.findMany()
        return bookings;
    } catch (error) {
        console.error("Failed to list booking:", error.message)
        throw error;
    }
}

export { createBooking, listBooking }