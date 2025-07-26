import crypto from 'crypto';
import express from 'express-session';
import { SEAT_HOLD_MS } from '../../config/booking.js';

const findSeat = async (tx, tripId, seatNo) => {
    return await tx.seat.findFirst({ where: {tripId, seatNo, status: 'available'}});
}

const updateSeatStatus = async (tx, seatId) => {
    return await tx.seat.update({ 
        where: { id: seatId}, 
        data: {status: 'booked'} 
    })
}

// Hash contact info (email or phone)
const hashContact = async(email, mobile) => {
    const data = `${email.toLowerCase()}|${mobile} `;
    return crypto.createHash('sha256').update(data).digest('hex');
}


const bookingToken = crypto.randomBytes(32).toString('hex');

const validateSeatHold = async (seatIds, tripId, db = prisma) => {
    const now = new Date();
    const holdCutoff = new Date(now.getTime() - SEAT_HOLD_MS);

    console.log(`Now: ${now.toISOString()}`);
    console.log(`Hold cutoff (expired before this): ${holdCutoff.toISOString()}`);

    const validSeats = await db.seat.findMany({
        where: {
            id: { in: seatIds },
            tripId: tripId,
            status: "RESERVED",
            reservedAt: { gte: holdCutoff },
        },
        select: {
      id: true,
      reservedAt: true,
      status: true,
    }
    });

    validSeats.forEach(seat => {
    console.log(`Seat ID: ${seat.id}, reservedAt: ${seat.reservedAt.toISOString()}, status: ${seat.status}`);
  });

  const seats = await db.seat.findMany({
  where: { id: { in: seatIds } },
  select: { id: true, reservedAt: true, status: true }
});
console.log('Seats before payment init:', seats);

    return {
        isValid: validSeats.length === seatIds.length,
        validCount: validSeats.length,
        expectedCount: seatIds.length,
        validSeats
    };
};



export {
    updateSeatStatus,
    findSeat,
    bookingToken,
    hashContact,
    validateSeatHold,
}