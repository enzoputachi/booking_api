import crypto from "crypto";
// import { Request } from "express";
import dotenv from "dotenv";
import pathFinder from "../utils/pathFinder.js";
import prisma from "../models/index.js";
import { confirmBookingDraft } from "./bookingService.js";
dotenv.config();
pathFinder();

const PAYSTACK_LIVE_SECRET_KEY = process.env.PAYSTACK_LIVE_SECRET_KEY || "";

const verifySignature = (req) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_LIVE_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return hash === req.headers["x-paystack-signature"];
};

const processPaymentEvent = async (paymentData) => {
  console.log("Process payment event for reference:", paymentData.reference);
  
  try {
    const { reference: paystackRef } = paymentData;

    // Check if payment is already processed
    const existingPayment = await prisma.payment.findUnique({
      where: { paystackRef },
      include: {
        booking: { include: { trip: { include: { route: true } } } },
      },
    });

    if (!existingPayment) {
      throw new Error('Payment not found');
    }

    if (existingPayment.status === 'PAID') {
      console.log('Payment already processed, skipping');
      return existingPayment.booking;
    }
    
    // Update payment status
    await prisma.payment.update({
      where: { paystackRef },
      data: {
        status: 'PAID',
        paidAt: new Date(paymentData.paid_at),
        amount: paymentData.amount,
        channel: paymentData.channel || null,
        currency: paymentData.currency,
        authorization: paymentData.authorization || null,
        customerId: paymentData.customer?.customer_code || null,
      },
    });

    // Get payment details with booking
    const payment = await prisma.payment.findUnique({
      where: { paystackRef },
      include: {
        booking: { include: { trip: { include: { route: true } } } },
      },
    });

    if (!payment?.booking) {
      throw new Error('Booking not found for payment');
    }

    const { booking } = payment;

    // Find seats using bookingToken from the booking
    const seats = await prisma.seat.findMany({
      where: { 
        bookingToken: booking.bookingToken,
        tripId: booking.tripId 
      },
    });

    if (seats.length === 0) {
      throw new Error('No reserved seats found for booking token');
    }

    const seatIds = seats.map(seat => seat.id);
    
    // Calculate payment totals
    const totalAmount = booking.trip.price * seatIds.length;
    const successfulPayments = await prisma.payment.findMany({
      where: { bookingId: booking.id, status: 'PAID' },
    });
    
    const amountPaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0) / 100;
    const amountDue = Math.max(totalAmount - amountPaid, 0);
    const isPaymentComplete = amountDue === 0;

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { amountDue, amountPaid, isPaymentComplete },
      include: { trip: { include: { route: true } } },
    });

    // Complete booking if fully paid
    await confirmBookingDraft({ bookingId: booking.id, seatIds });


    return updatedBooking;
  } catch (error) {
    console.error('Error processing payment event:', error);
    throw error;
  }
};


export {
  verifySignature,
  processPaymentEvent
}





// Call cleanupExpiredReservations() before seat allocation or seat lookup

