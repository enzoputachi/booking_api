import prisma from "../models/index.js";
import { createSeat } from "./seatService.js";


// ================================================ //
//                      CORE FEATURES               //
//================================================= //


// Create a new trip with associated bus and seats
const createTrip = async(validatedTripdata) => {
    const { busId } = validatedTripdata;

    return await prisma.$transaction(async (tx) => {
        const bus = await tx.bus.findUnique({ where: { id: busId} });

        if (!bus) throw new Error("Bus not found")

        const trip = await tx.trip.create({ data: validatedTripdata })

        // const validatedSeatData = { tripId: trip.id, capacity: bus.capacity, seatsPerRow: bus.seatsPerRow}
        const validatedSeatData = { tripId: trip.id, capacity: bus.capacity}
        await createSeat(validatedSeatData, tx)

        return trip;
    })
}

// Fetch a trip by its ID with associated seats, route, and bus details
const getTripById = async(tripId, db = prisma) => {
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

const getAvailableSeatCountPerTrip = async (db = prisma) => {
    const availableSeats = await db.seat.groupBy({
        by: ['tripId'],
        where: {
            status: 'AVAILABLE',
        },
        _count: {
            _all: true,
        },
    });

    // convert to a map for quick lookup
    const seatCountMap = new Map(
        availableSeats.map(item => [item.tripId, item._count._all])
    )

    return seatCountMap;
}

// Fetch all trips with their available seat counts
const getAllTrips = async(db = prisma) => {
    
    const [trips, seatCountMap] = await Promise.all([
        db.trip.findMany({
            include: { 
                seats: true,
                route: true,
                bus: true,
            },
        }),
        getAvailableSeatCountPerTrip(db)
    ]);

    return trips.map(trip => ({
        ...trip,
        availableSeatsCount: seatCountMap.get(trip.id) || 0,
    }));
}

// Fetch trips with their seats and bus details based on filters and pagination
/**
 * Fetch trips with their seats and bus details based on filters and pagination
 * @param {Object} filters - Filters to apply to the trip query
 * @param {Object} pagination - Pagination options (skip, take)
 * @param {Object} db - Prisma client instance (default: prisma)
 * @returns {Promise<Array>} - Array of trips with seats and bus details
 */
const getTripsWithSeatsAndBus = async(filters = {}, pagination = {}, db = prisma) => {
    const query = buildTripQuery(filters);
    // console.log('Trip query:', JSON.stringify(query, null, 2));

    const { skip = 0, take = undefined } = pagination;

    return await db.trip.findMany({...query, skip, take});
}

// Update a trip with new data
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

// Build a query object for filtering trips based on origin, destination, and date
/**
 * Build a query object for filtering trips based on origin, destination, and date
 * @param {Object} params - Parameters for filtering trips
 * @param {string} params.origin - Origin location (optional)
 * @param {string} params.destination - Destination location (optional)
 * @param {string} params.date - Date of the trip (optional)
 * @returns {Object} - Query object for Prisma findMany method
 */
const buildTripQuery = ({ origin, destination, date } = {}) => {
    const where = {};

    // const origin = req.query.origin?.toLowerCase();
    // const destination = req.query.destination?.toLowerCase();

    if (origin && destination ) {
        where.route = {
            origin: { contains: origin,},
            destination: { contains: destination,},
        }
    }

    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);

        where.departTime = { 
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
    
    // Promise.allSettled is a more resillient version of Promise.all
    const [trips, total] = await Promise.all([
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
        },
    }
}

const validateBookableTrip = async(tripId, db = prisma) => {
    const trip = await getTripById(tripId, db);

    if (!trip) throw new Error('Trip not found');

    if (trip.departAt < new Date()) throw new Error('Cannot book past trips')

    if (!trip.seats.some(seat => seat.status === 'AVAILABLE')) {
        throw new Error('no seats available');
    }

    return trip
}

export {
    createTrip,
    getTripById,
    getTripsWithSeatsAndBus,
    updateTrip,
    getAllTrips,
    deleteTrip,
    buildTripQuery,
    findAvailableTrips,
    validateBookableTrip,
}