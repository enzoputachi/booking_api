import prisma from "../models/index.js";
import { createSeat } from "./seatService.js";


// ================================================ //
//                      CORE FEATURES               //
//================================================= //


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

const getTrip = async(tripId, db = prisma) => {
    if (!tripId) return;
    
    return await db.trip.findUnique({
        where: {id: tripId},
        include: { 
            seats: true,
            route: true,
            bus: true,
        },
    })
}

const getTripsWithSeatsAndBus = async(filters = {}, pagination = {}, db = prisma) => {
    const query = buildTripQuery(filters)
    const { skip = 0, take = undefined } = pagination;

    return await db.trip.findMany({...query, skip, take});
}

const updateTrip = async(tripId, data, db = prisma) => {
    return await db.trip.update({
        where: { id: tripId },
        data,
    })
}

const deleteTrip = async(tripId) => {
    return await prisma.trip.delete({
        where: { id: tripId }
    })
}

const buildTripQuery = ({ origin, destination, date } = {}) => {
    const where = {};

    if (origin && destination ) {
        where.route = {
            origin: { equals: origin, mode: 'insensitive' },
            destination: { equals: destination, mode: 'insensitive' },
        }
    }

    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);

        where.departAt = {
            gte: start,
            lt: end,
        }
    }


    return {
        where,
        include: {
            bus: true,
            seats: true,
        }
    }

}

// ================================================ //
//                      USER-FACING FEATURES       //
//================================================ //

const findAvailableTrips = async({ origin, destination, date, page = 1, limit = 10 }, db = prisma) => {
    const skip = (page - 1) * limit;
    const filters = { origin, destination, date }
    
    const [trips, total] = await promise.all([
        getTripsWithSeatsAndBus(filters, {skip, take: limit }),
        db.trip.count({ where: buildTripQuery(filters).where }),
    ])

    return {
        trips,
        meta: {
            total,
            page,
            pages: Math.ceil(total / limit),
            hasNext: skip + limit < total,
        }
    }
}

const validateBookableTrip = async(tripId, db = prisma) => {
    const trip = await getTrip(tripId, db);

    if (!trip) throw new Error('Trip not found');

    if (trip.departAt < new Date()) throw new Error('Cannot book past trips')

    if (!trip.seats.some(seat => seat.status === 'AVAILABLE')) {
        throw new Error('no seats available');
    }

    return trip
}

export {
    createTrip,
    getTrip,
    getTripsWithSeatsAndBus,
    updateTrip,
    deleteTrip,
    buildTripQuery,
    findAvailableTrips,
    validateBookableTrip,
}