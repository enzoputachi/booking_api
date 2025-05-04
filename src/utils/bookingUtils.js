const findSeat = async (tx, tripId, seatNo) => {
    return await tx.seat.findFirst({ where: {tripId, seatNo, status: 'available'}});
}

const updateSeatStatus = async (tx, seatId) => {
    return await tx.seat.update({ 
        where: { id: seatId}, 
        data: {status: 'booked'} 
    })
}

const findBooking = () => {
    return 
}

export {
    updateSeatStatus,
    findSeat
}