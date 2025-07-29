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

/**
 * Helper function to assign seats to a booking
 * @param {Object} booking - The booking object
 * @param {number} requiredSeats - Number of seats needed
 * @param {Object} tx - Prisma transaction client
 * @returns {Array} - Array of assigned seat numbers
 * */
const assignSeatsToBookingHelper = async (booking, requiredSeats = 1, tx) => {
  // Check if booking already has enough seats
  if (booking.seat && booking.seat.length >= requiredSeats) {
    console.log(`Booking ${booking.bookingToken} already has ${booking.seat.length} seats assigned`);
    return booking.seat.map(s => s.seatNo);
  }

  // Calculate additional seats needed
  const currentSeats = booking.seat ? booking.seat.length : 0;
  const additionalSeatsNeeded = requiredSeats - currentSeats;

  if (additionalSeatsNeeded <= 0) {
    return booking.seat.map(s => s.seatNo);
  }

  // Fetch available seats for the trip
  const availableSeats = await tx.seat.findMany({
    where: {
      tripId: booking.tripId,
      status: 'AVAILABLE',
      bookingId: null
    },
    orderBy: {
      seatNo: 'asc' // Assign seats in order
    },
    take: additionalSeatsNeeded
  });

  // Check if enough seats are available
  if (availableSeats.length < additionalSeatsNeeded) {
    throw new Error(
      `Insufficient seats available. Requested: ${additionalSeatsNeeded}, Available: ${availableSeats.length}`
    );
  }

  // Assign seats to booking
  const seatsToAssign = availableSeats.slice(0, additionalSeatsNeeded);
  
  // Update seat records - mark as BOOKED and link to booking
  await Promise.all(
    seatsToAssign.map(seat => 
      tx.seat.update({
        where: { id: seat.id },
        data: {
          status: 'BOOKED',
          bookingId: booking.id,
          reservedAt: new Date()
        }
      })
    )
  );

  // Log the seat assignment activity
  await tx.bookingLog.create({
    data: {
      bookingId: booking.id,
      action: 'SEATS_ASSIGNED_BY_ADMIN',
      metadata: {
        assignedSeats: seatsToAssign.map(s => s.seatNo),
        totalSeats: currentSeats + seatsToAssign.length,
        adminAction: true,
        previousSeats: booking.seat ? booking.seat.map(s => s.seatNo) : []
      }
    }
  });

  // Return all seat numbers (existing + newly assigned)
  const allSeatNumbers = [
    ...(booking.seat ? booking.seat.map(s => s.seatNo) : []),
    ...seatsToAssign.map(s => s.seatNo)
  ];

  return allSeatNumbers;
};

/**
 * Helper function to release seats when booking is cancelled
 * @param {Object} booking - The booking object
 * @param {Object} tx - Prisma transaction client
 */
const releaseSeatsHelper = async (booking, tx) => {
  if (!booking.seat || booking.seat.length === 0) {
    return;
  }

  const seatNumbers = booking.seat.map(s => s.seatNo);

  // Release seats
  await tx.seat.updateMany({
    where: {
      bookingId: booking.id
    },
    data: {
      status: 'AVAILABLE',
      bookingId: null,
      reservedAt: null
    }
  });

  // Log the seat release activity
  await tx.bookingLog.create({
    data: {
      bookingId: booking.id,
      action: 'SEATS_RELEASED_BY_ADMIN',
      metadata: {
        releasedSeats: seatNumbers,
        reason: 'Booking cancelled by admin'
      }
    }
  });

  console.log(`Released ${seatNumbers.length} seats for booking ${booking.bookingToken}:`, seatNumbers);
};



export {
    updateSeatStatus,
    findSeat,
    bookingToken,
    hashContact,
    validateSeatHold,
    assignSeatsToBookingHelper,
    releaseSeatsHelper,
}