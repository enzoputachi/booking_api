import prisma from "../models/index.js";

const createSeat = async(validatedSeatdata, client = prisma) => {
    const { tripId, capacity, seatsPerRow } = validatedSeatdata;
    const seatNumbers = generateSeatNumbers(capacity, seatsPerRow)
    
    const seats = seatNumbers.map(seatNumber => ({
        tripId: tripId,
        seatNo: seatNumber,
        status: 'AVAILABLE'
    }))

    try {
        return await client.seat.createMany({ data: seats, skipDuplicates: true })
    } catch (error) {
        console.error("Failed to create seats:", err.message);
        throw err;
    }
}

const getSeat = async(seatId = '') => {

    if (seatId) {
        return await prisma.seat.findUnique({
            where: {id: seatId}
        })
    }

    return await prisma.seat.findMany();
}


const updateSeat = async(seatId, data) => {
    return await prisma.seat.update({
        where: { id: seatId },
        data,
    })
}


const deleteSeat = async(seatId) => {
    return await prisma.seat.delete({
        where: { id: seatId }
    })
}

// Helper function to generate seat number
const generateSeatNumbers = (capacity = 18, seatsPerRow = 4) => {
    const seats = [];
    const rows = Math.ceil(capacity / seatsPerRow)

    for (let row = 0; row < rows; row++) {
        const rowLetter = String.fromCharCode(65 + row);

        for (let col = 1; col <=  seatsPerRow; col++) {
            seats.push(`${rowLetter}${col}`)
            if (seats.length === capacity) return seats;
        }
    }

    return seats;
}

export {
    createSeat,
    getSeat,
    updateSeat,
    deleteSeat,
}