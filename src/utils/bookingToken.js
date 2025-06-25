import { nanoid } from "nanoid";
import prisma from './../models/index.js';


export const generateUniqueBookingToken = async (db = prisma) => {
    const PREFIX = `CD${new Date().getFullYear().toString().slice(-2)}-`
    let token;
    let exists = true;

    while (exists) {
        const id = nanoid(10);
        token = PREFIX + id;

        exists = await db.booking.findUnique({
            where: { bookingToken: token }
        });
    }

    return token;
}