import prisma from "../models/index.js";


export const retrieveBooking = async (bookingToken) => {
    const booking = await prisma.booking.findUnique({
        where: { bookingToken },
        include: {
            trip: {
                include: {
                    route: true,
                    bus: true,
                },
            },
        },
    })

    if (!booking) {
        throw new Error('Booking not found for you');
    }

    return booking;
}