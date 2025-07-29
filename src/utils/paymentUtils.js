import prisma from "../models/index.js";

const validateBookingExists = async (bookingId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { 
            trip: { include: { route: true } },
            payment: { where: { status: 'PAID' } }
        }
    });

    if (!booking) {
        throw {
            status: 404,
            message: 'Booking not found'
        };
    }

    return booking;
};

const validateSeatAvailability = async (seatIds, bookingId) => {
    const seats = await prisma.seat.findMany({
        where: { id: { in: seatIds } },
        select: { id: true, status: true, bookingId: true }
    });

    // Check if any seats are already booked by a different booking
    const conflictingSeats = seats.filter(seat => 
        seat.status === 'BOOKED' && seat.bookingId !== bookingId
    );

    if (conflictingSeats.length > 0) {
        throw {
            status: 409,
            message: 'Some seats are already booked by another booking',
            conflictingSeats: conflictingSeats.map(s => s.id)
        };
    }

    // Check if seats are valid (reserved or booked for this booking)
    const validSeats = seats.filter(seat => 
        seat.status === 'RESERVED' || 
        (seat.status === 'BOOKED' && seat.bookingId === bookingId)
    );

    if (validSeats.length !== seatIds.length) {
        const invalidSeatIds = seatIds.filter(id => 
            !validSeats.some(seat => seat.id === id)
        );
        throw {
            status: 400,
            message: 'Some seats are not available for booking',
            invalidSeats: invalidSeatIds
        };
    }

    return validSeats;
};

const validatePaymentAmount = async (booking, seatIds, requestedAmount) => {
    // Calculate payment totals
    const totalBookingAmount = booking.trip.price * seatIds.length;
    const amountPaid = booking.payment.reduce((sum, p) => sum + p.amount, 0) / 100; // Convert from kobo
    const amountDue = Math.max(totalBookingAmount - amountPaid, 0);

    // Check if booking is already fully paid
    if (amountDue === 0) {
        throw {
            status: 400,
            message: 'Booking is already fully paid',
            details: {
                totalAmount: totalBookingAmount,
                amountPaid: amountPaid,
                amountDue: amountDue
            }
        };
    }

    const requestedAmountInNaira = requestedAmount / 100; // Convert from kobo

    // Validate payment amount doesn't exceed amount due
    if (requestedAmountInNaira > amountDue) {
        throw {
            status: 400,
            message: `Payment amount (₦${requestedAmountInNaira}) exceeds amount due (₦${amountDue})`,
            details: {
                totalAmount: totalBookingAmount,
                amountPaid: amountPaid,
                amountDue: amountDue,
                requestedAmount: requestedAmountInNaira
            }
        };
    }

    return {
        totalAmount: totalBookingAmount,
        amountPaid: amountPaid,
        amountDue: amountDue,
        requestedAmount: requestedAmountInNaira,
        remainingDue: amountDue - requestedAmountInNaira
    };
};

export {
    validateBookingExists,
    validateSeatAvailability,
    validatePaymentAmount,
}