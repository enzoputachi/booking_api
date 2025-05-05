import prisma from "../models/index.js";
import { createSeat } from "./seatService.js";

const createTrip = async(validatedTripdata) => {
    const { busId } = validatedTripdata;

    return await prisma.$transaction(async (tx) => {
        const bus = await tx.bus.findUnique({ where: { id: busId} });

        if (!bus) throw new Error("Bus not found")

        const trip = await tx.trip.create({ data: validatedTripdata })

        const validatedSeatdata = { tripId: trip.id, capacity: bus.capacity, seatsPerRow: bus.seatsPerRow}
        await createSeat(validatedSeatdata, tx)

        return trip;
    })
}

const getTrip = async(tripId = '') => {

    if (tripId) {
        return await prisma.trip.findUnique({
            where: {id: tripId}
        })
    }

    return await prisma.trip.findMany();
}


const updateTrip = async(tripId, data) => {
    return await prisma.trip.update({
        where: { id: tripId },
        data,
    })
}


const deleteTrip = async(tripId) => {
    return await prisma.trip.delete({
        where: { id: tripId }
    })
}

export {
    createTrip,
    getTrip,
    updateTrip,
    deleteTrip,
}