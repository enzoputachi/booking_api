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
const hashContact = async() => {
    return crypto.createHash('sha256').update(contactInfo).digest('hex');
}

const userAgent = req.get('User-Agent') || 'unknown'

const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'

const bookingToken = crypto.randomBytes(32).toString('hex');



export {
    updateSeatStatus,
    findSeat
}