
import { SeatStatus } from '../../prisma/src/generated/prisma/index.js';
import prisma from '../models/index.js';
import pathFinder from '../utils/pathFinder.js';
import { confirmBookingDraft } from './bookingService.js';
import { verifyPayment } from './paymentService.js';
import { generateTicketPDF } from './pdfService.js';
import dotenv from 'dotenv';
dotenv.config()

pathFinder();

console.log(`APP URL: ${process.env.APP_URL}`);



export const processBookingPaymentAndIssueTicket = async(paystackRef) => {
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
            seat: true 
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

    if (!booking.seat) {
      throw new Error("Seat data missing on booking");
    }

    const seatIds = booking.seat.map(seat => seat.id)

    await prisma.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: SeatStatus.BOOKED }
    })

    await confirmBookingDraft({ bookingId: booking.id, seatIds})

    // Generate the ticket PDF
    const { path: ticketPath, exists } = await generateTicketPDF(booking);
    console.log('PDF created?', exists, 'at', ticketPath);

    // Enqueue an email job to send the ticket
    if (!exists) {
        throw new Error(`PDF generation failed; no file at ${ticketPath}`);
    }

    const downloadUrl = `${process.env.APP_URL}/api/ticket/${booking.bookingToken}`

    return { downloadUrl, booking }
}