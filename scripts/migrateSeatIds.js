import prisma from "../src/models/index.js";

const migrateSeatIds = async () => {
    const bookings = await prisma.booking.findMany({
        where: { seatId: { not: null} },
        select: { id: true, seatId: true}
    });

    // Check if there are any bookings with seatId
    if (bookings.length === 0) {
        console.log("No bookings with seatId found.");
        return;
    }

    // 2. For each booking, update the corresponding seat
    for ( const booking of bookings) {
        await prisma.seat.update({
            where: { id: booking.seatId },
            data: { bookingId: booking.id }
        });
    }

    console.log(`Successfully migrated ${bookings.length} bookings to their respective seats.`);
    await prisma.$disconnect();
}

migrateSeatIds()
    .then(() => console.log("Migration completed successfully."))
    .catch((error) => console.error("Migration failed:", error))
    .finally(() => prisma.$disconnect());