import { SeatStatus } from "../../prisma/src/generated/prisma/index.js";
import prisma from "../models/index.js";
// import { redlock } from "../models/redis.js";


// ================================================ //
//                      CORE FEATURES               //
//================================================= //

const createSeat = async(validatedSeatdata, db = prisma) => {
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

const getSeatById = async(seatId, db = prisma) => {
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

const updateSeat = async({ seatIds, tripId, data },  db = prisma) => {
    const result = await db.seat.updateMany({
        where: { 
            id: { in: seatIds}, 
            tripId,
        },
        data,
    })

    if (result.count !== seatIds.length) {
        throw new Error("Some seats were not found or not updated.");
    }
    
    return result;
}

const deleteSeat = async(seatId, db = prisma) => {
    return await db.seat.delete({
        where: { id: seatId }
    })
}

// Helper function to generate seat number
const generateSeatNumbers = (capacity = 18) => {
    const seats = [];
    // const rows = Math.ceil(capacity / seatsPerRow)

    // for (let row = 0; row < rows; row++) {
    //     const rowLetter = String.fromCharCode(65 + row);

    //     for (let col = 1; col <=  seatsPerRow; col++) {
    //         seats.push(`${rowLetter}${col}`)
    //         if (seats.length === capacity) return seats;
    //     }
    // }

    for (let i = 1; i <= capacity; i++) {
        seats.push(i.toString());
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

const reserveSeat = async({tripId, seatId}, db = prisma) => {
    const now = new Date();
    const expiryCutoff = new Date(now.getTime() - 5 * 60_000);
    const seatIds = Array.isArray(seatId) ? seatId : [seatId];
    console.log("Twice:", seatId, tripId);
    

    const updated = await db.seat.updateMany({
        where: {
            id: { in: seatIds }, 
            tripId,
            OR: [
                { status: 'AVAILABLE' },
                {
                    status: 'RESERVED',
                    reservedAt: { not: null, lt: expiryCutoff } 
                }
            ],
            NOT: { status: 'BOOKED' }
        },
        data: {
            status: 'RESERVED',
            reservedAt: now
        }
    }); 

    if (updated.count === 0) {
        throw new Error('Seat not available');
    }

    return db.seat.findMany({ where: { id: { in: seatIds } } });
}

const confirmSeat = async(seatIds, db = prisma) => {
    const validatedSeatIds = Array.isArray(seatIds) ? seatIds : [seatIds]
    return await db.seat.updateMany({
        where: { id: { in: validatedSeatIds } },
        data: { status: SeatStatus.BOOKED }
    })
}

// ================================================ //
//                  EXTREME FEATURES       //
//================================================ //
const cleanSeatFromBooking = async() => {
    const availableSeatsWithBookings = await prisma.seat.findMany({
        where: {
            status: SeatStatus.AVAILABLE,
            booking: {
                isNot: null,
            }
        },
        select: {
          id: true,
          booking: {
            select: { id: true },
          }  
        }
    });

    if (availableSeatsWithBookings.length = 0) {
        console.log('No seats need clean up');
        return 0;
    }

    const bookingIds = availableSeatsWithBookings.map(
        (seat) => seat.booking?.id
    );

    const { count } = await prisma.booking.deleteMany({
        where: {
            id: { in: bookingIds }
        }
    });

    console.log(`Unshackled ${count} booking(s) from AVAILABLE seat(s)`);
    return count;
}

export {
    createSeat,
    getSeatById,
    getAllSeats,
    updateSeat,
    deleteSeat,
    reserveSeat,
    findAvailableSeats,
    confirmSeat,
    cleanSeatFromBooking
}