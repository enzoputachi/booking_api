import { SeatStatus } from "../../prisma/src/generated/prisma/index.js";
import prisma from "../models/index.js";



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

export const freeExpiredSeats = async() => {
    const now = new Date();
    const EXPIRATION_MS = 5 * 60 * 1000;
    const threshold = new Date(now.getTime() - EXPIRATION_MS);
    const expired = await prisma.seat.findMany({
        where: {
            status: SeatStatus.RESERVED,
            reservedAt: { lt: threshold }
        },
        select: { id: true }
    });

    if (expired.length === 0) {
        console.log('No expired seats to free.');
        return 0;
    }

    const seatIds = expired.map(seat => seat.id);

    // 2. fetch booking IDs tied to those seats
    const bookings = await prisma.booking.findMany({
        where: { seatId: { in: seatIds } },
        select: { id: true },
    });

    const bookingIds = bookings.map((b) => b.id);

    // 3–5. run deletions + update in one transaction
    const [ deletePaymentsResult, deleteBookingsResult, updateSeatsResult ] =
    await prisma.$transaction([
      // 3. delete any Payments for these bookings
      prisma.payment.deleteMany({
        where: { bookingId: { in: bookingIds } },
      }),

      // 4. delete the Bookings
      prisma.booking.deleteMany({
        where: { id: { in: bookingIds } },
      }),

      // 5. update the Seats to AVAILABLE
      prisma.seat.updateMany({
        where: { id: { in: seatIds } },
        data: {
          status: SeatStatus.AVAILABLE,
          reservedAt: null,
        },
      }),
    ]);


    console.log(
    `Freed ${updateSeatsResult.count} expired seat(s); ` +
    `deleted ${deleteBookingsResult.count} booking(s) ` +
    `and ${deletePaymentsResult.count} payment record(s).`
  );

  return updateSeatsResult.count;
}