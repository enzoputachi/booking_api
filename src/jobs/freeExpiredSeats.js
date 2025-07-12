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
            status: "RESERVED",
            reservedAt: { lt: threshold }
        },
        select: { id: true, bookingId: true }
    });

    if (expired.length === 0) {
        console.log('No expired seats to free.');
        return 0;
    }

    const expiredSeatIds = expired.map(seat => seat.id);
    const expiredBookingIds = expiredSeatIds.map((s) => s.bookingId).filter((id) => typeof id === "number")

    // 2. fetch booking IDs tied to those seats
    const bookingsToDelete = await prisma.booking.findMany({
        where: {
          id: { in: expiredBookingIds },
          status: "PENDING",
        },
        select: { id: true },
    });

    const bookingIdsToDelete = bookingsToDelete.map((b) => b.id);

    // 3–5. run deletions + update in one transaction
    const [ deletePaymentsResult, deleteBookingsResult, updateSeatsResult ] =
    await prisma.$transaction([
      // 3. delete any Payments for these bookings
      prisma.payment.deleteMany({
        where: { bookingId: { in: bookingIdsToDelete } },
      }),

      // 4. delete the Bookings
      prisma.booking.deleteMany({
        where: { id: { in: bookingIdsToDelete } },
      }),

      // 5. update the Seats to AVAILABLE
      prisma.seat.updateMany({
        where: { id: { in: expiredSeatIds } },
        data: {
          status: "AVAILABLE",
          reservedAt: null,
          bookingId: null,
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