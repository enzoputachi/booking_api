
import { SeatStatus } from '../../prisma/src/generated/prisma/index.js';
import prisma from '../models/index.js';
import pathFinder from '../utils/pathFinder.js';
import { adminCreateBooking, confirmBookingDraft } from './bookingService.js';
import { adminCreatePayment, verifyPayment } from './paymentService.js';
import { generateTicketPDF } from './pdfService.js';
import dotenv from 'dotenv';
import { confirmSeat } from './seatService.js';
dotenv.config()

pathFinder();

// console.log(`APP URL: ${process.env.APP_URL}`);



export const processBookingPaymentAndIssueTicket = async({ paystackRef, seatIds}, res) => {
    const paymentRecord = await verifyPayment(paystackRef);
    const bookingId = paymentRecord.bookingId;

    // Load the booking, including trip and seat
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { 
            trip: {
                include: {
                    route: true
                }
            },
        }
    });

    if (!booking) {
        throw new Error(`Booking not found for ID ${bookingId}`)
    }

    if (!booking.trip) {
      throw new Error("Trip data missing on booking");
    }

    if (!booking.trip.route) {
      throw new Error("Route missing on trip");
    }

    // if (!booking.seat) {
    //   throw new Error("Seat data missing on booking");
    // }

    const successfulPayments = await prisma.payment.findMany({
      where: {
        bookingId,
        status: 'PAID',
      },
    });


    // const seatIds = booking.seat.map(seat => seat.id)
    const pricePerSeat = booking.trip.price;
    const seatCount = seatIds.length;
    const totalAmount = pricePerSeat * seatCount;

    const amountPaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0) / 100
    const amountDue = Math.max(totalAmount - amountPaid, 0)

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        amountDue,
        amountPaid,
        isPaymentComplete: amountDue === 0,
      },
      include: {
        // ← explicitly bring back the nested data your email template needs:
        trip: {
          include: {
            route: true,
          },
        },
       
      },
    });

    console.log(
      "About to confirm booking",
      {
      seatCount,
      pricePerSeat,
      totalAmount,
      amountPaid,
      amountDue,
    });

    await confirmBookingDraft({ bookingId: booking.id, seatIds})

    return updatedBooking;
}

export const adminBookingOrch = async (bookingData) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await adminCreateBooking(bookingData, tx);
    const amountPaidKobo = (booking.amountPaid * 100)
    const paymentData = {
      bookingId: booking.id,
      amount: amountPaidKobo,
      status: "PAID",
      channel: "admin",
      customerId: booking.email,
      paidAt: new Date().toISOString()
    };
    await confirmSeat({ seatIds: bookingData.seatId, bookingId: booking.id, bookingToken: booking.bookingToken }, tx)
    const payment = await adminCreatePayment(paymentData, tx);
    return { booking, payment };
  });
};