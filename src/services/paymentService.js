
// import { PaymentStatus } from './../../prisma/src/generated/prisma/index.d.ts';
import { initializePaystackTransaction, verifyPaystackTransaction } from './paystackService.js';
import prisma from '../models/index.js';
import { PaymentStatus } from "../../prisma/src/generated/prisma/index.js";

// create
const createPaymentIntent = async({bookingId, amount, channel, email}, db = prisma) => {

    const booking =  await db.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true },
    })

    if (!booking) throw new Error('Booking not found');
    if (booking.payment) throw new Error('Payment already exists for this bookinf');

    const { reference, authorization_url } = await initializePaystackTransaction({ email, amount })

    const payment = await db.payment.create({
        data: {
            bookingId,
            paystackRef: reference,
            amount,
            channel,
            authorization: {authorization_url},
            status: PaymentStatus.PENDING,
        }
    })

    return payment;
}


const verifyPayment = async(paystackRef, db= prisma) => {

    const payment = await db.payment.findUnique({
        where: { paystackRef }
    });

    if (!payment) throw new Error('Payment not found');

    const { verified, data } = await verifyPaystackTransaction(paystackRef)

    if (!verified) {
        throw new Error('Transaction not successful')
    }

    const updated = await db.payment.update({
        where: { paystackRef },
        data: {
            status: PaymentStatus.PAID,
            paidAt: new Date(data.paid_at),
            amount: data.amount,
            channel: data.channel || null,
            currency: data.currency,
            authorization: data.authorization || null,
            customerId: data.customer?.customer_code || null
        },
    });



    return updated;
}

const getPaymentById = async(id, db = prisma) => {
    return db.payment.findUnique({ where: { id } })
}


// 4. Get payment by Paystack reference
export const getPaymentByRef = async (paystackRef, db = prisma) => {
  return db.payment.findUnique({ where: { paystackRef } });
};


// 5. Update payment status manually (fallback)
export const updatePaymentStatus = async ({ id, status }, db = prisma) => {
  return db.payment.update({
    where: { id },
    data: { status },
  });
}

// 6. List all payments for a booking (for audit, admin)
export const listPaymentsForBooking = async (bookingId, db = prisma) => {
  return db.payment.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'desc' },
  });
}


export {
    createPaymentIntent,
    verifyPayment,
    getPaymentById
}