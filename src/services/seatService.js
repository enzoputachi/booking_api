import prisma from "../models/index.js";

const createSeat = async(validatedSeatdata) => {
    return await prisma.seat.create({ data: validatedSeatdata })
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

export {
    createSeat,
    getSeat,
    updateSeat,
    deleteSeat,
}