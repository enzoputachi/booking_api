
import { SeatStatus } from '../../prisma/src/generated/prisma/index.js';
import prisma from '../models/index.js';
import pathFinder from '../utils/pathFinder.js';
import { confirmBookingDraft } from './bookingService.js';
import { verifyPayment } from './paymentService.js';
import { generateTicketPDF } from './pdfService.js';
import dotenv from 'dotenv';
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
      "Testing amountDue",
      {
      seatCount,
      pricePerSeat,
      totalAmount,
      amountPaid,
      amountDue,
    });

    // Since payment was successful, force confirm
   
    
    // await prisma.seat.updateMany({
    //     where: { id: { in: seatIds } },
    //     data: { status: SeatStatus.BOOKED, bookingId: bookingId }
    // })

    await confirmBookingDraft({ bookingId: booking.id, seatIds})

    return updatedBooking;
}