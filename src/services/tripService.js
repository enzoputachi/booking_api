import prisma from "../models/index.js";

const createTrip = async(validatedTripdata) => {
    return await prisma.trip.create({ data: validatedTripdata })
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