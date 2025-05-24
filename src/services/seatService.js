import prisma from "../models/index.js";
import { redlock } from "../models/redis.js";


// ================================================ //
//                      CORE FEATURES               //
//================================================= //

const createSeat = async({validatedSeatdata, db = prisma}) => {
    const { tripId, capacity, seatsPerRow } = validatedSeatdata;
    const seatNumbers = generateSeatNumbers(capacity, seatsPerRow)
    
    const seats = seatNumbers.map(seatNumber => ({
        tripId: tripId,
        seatNo: seatNumber,
        status: 'AVAILABLE'
    }))

    try {
        return await db.seat.createMany({ data: seats, skipDuplicates: true })
    } catch (error) {
        console.error("Failed to create seats:", err.message);
        throw err;
    }
}

const getSeatById = async({seatId, db = prisma}) => {
    if (!seatId) throw new Error('No seat Id')

    const seat = await db.seat.findUnique({
        where: {id: seatId}
    })

    return seat;
}

const getAllSeats = async({ filter = {}, include = null} = {}, db = prisma) => {
    const seats = await db.seat.findMany({ where: filter, include: include || undefined });
    return seats;
}

const updateSeat = async({ seatId, data, db = prisma }) => {
    return await db.seat.update({
        where: { id: seatId },
        data,
    })
}

const deleteSeat = async(seatId, db = prisma) => {
    return await db.seat.delete({
        where: { id: seatId }
    })
}

// Helper function to generate seat number
const generateSeatNumbers = (capacity = 18, seatsPerRow = 4) => {
    const seats = [];
    const rows = Math.ceil(capacity / seatsPerRow)

    for (let row = 0; row < rows; row++) {
        const rowLetter = String.fromCharCode(65 + row);

        for (let col = 1; col <=  seatsPerRow; col++) {
            seats.push(`${rowLetter}${col}`)
            if (seats.length === capacity) return seats;
        }
    }

    return seats;
}

// ================================================ //
//                 USER-FACING FEATURES             //
//================================================= //

const findAvailableSeats = async(tripId, db = prisma) => {
    const availableSeats = await getAllSeats(
        { tripId,  status: 'AVAILABLE'}, 
        db
    )
    return availableSeats;
}

const reserveSeat = async(tripId, seatId, db = prisma) => {
    const lockKey = `lock:seat:${seatId}`;
    const lock = await redlock.acquire([lockKey], (1000 * 20));

    try {
        const seat = await getSeatById(seatId, db);
        if (!seat || seat.tripId !== tripId) throw new Error('Seat not found')

        const now = new Date();

        if (seat.status === 'RESERVED') {
            const expired = seat.reservedAt && new Date(seat.reservedAt.getTime() + RESERVATION_EXPIRY_MINUTES * 60000) < now;

            if (!expired) throw new Error('Seat already reserved')
        }

        if (seat.status === 'BOOKED') throw new Error ('Seat already booked')

        return await db.seat.update({
            where: { id: seatId },
            data: {
                status: 'RESERVED',
                reservedAt: now,
            },
        });
    } finally {
        await lock.release();
    }   
}

const confirmSeat = async(seatId, db = prisma) => {
    return await updateSeat({
        seatId, 
        data: {status: 'BOOKED'},
        db
    })
}

export {
    createSeat,
    getSeatById,
    getAllSeats,
    updateSeat,
    deleteSeat,
    reserveSeat,
    findAvailableSeats,
    confirmSeat
}