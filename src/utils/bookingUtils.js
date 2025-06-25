import crypto from 'crypto';
import express from 'express-session';

const findSeat = async (tx, tripId, seatNo) => {
    return await tx.seat.findFirst({ where: {tripId, seatNo, status: 'available'}});
}

const updateSeatStatus = async (tx, seatId) => {
    return await tx.seat.update({ 
        where: { id: seatId}, 
        data: {status: 'booked'} 
    })
}

// Hash contact info (email or phone)
const hashContact = async(email, mobile) => {
    const data = `${email.toLowerCase()}|${mobile} `;
    return crypto.createHash('sha256').update(data).digest('hex');
}


const bookingToken = crypto.randomBytes(32).toString('hex');



export {
    updateSeatStatus,
    findSeat,
    bookingToken,
    hashContact
}