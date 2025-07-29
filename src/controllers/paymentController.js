import { processBookingPaymentAndIssueTicket } from "../services/bookingOrchestrator.js";
import { createPaymentIntent, getAllPayments, updatePaymentService, verifyPayment } from "../services/paymentService.js";
import { sendEmail } from "../services/mailService.js";
import prisma from "../models/index.js";
import dotenv from 'dotenv';
import pathFinder from "../utils/pathFinder.js";
import { validateSeatHold } from "../utils/bookingUtils.js";
dotenv.config();
pathFinder()



const handlePaymentIntent = async(req, res) => {
    const { email, amount, bookingId, seatIds, channel, isSplitPayment } = req.body;

     if (!email || !amount || !bookingId || !seatIds || !Array.isArray(seatIds)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, amount, bookingId, seatIds'
            });
    }    

    try {

        if (typeof isSplitPayment === 'boolean') {
            await prisma.booking.update({
                where: { id: bookingId },
                data: { isSplitPayment },
            })
        };

        const payment = await createPaymentIntent({email, amount, seatIds, bookingId, channel})

        console.log("LOG Payment Ref:", payment);
        
        res.status(201).json({
            meaasage: 'Transaction initialized',
            status: 'success',
            data: payment
        })
    } catch (error) {
        console.error('Paystack Init Error:', error?.response?.data || error.message);
        res.status(500).json({ message: 'Transaction initaialization failed', error: error?.response?.data || error.message})
    }
}


const handleVerifyPayment = async(req, res) => {
    const {reference: paystackRef, seatIds } = req.body;


    console.log("Paystack Ref and seadis:", paystackRef, seatIds)

    try {
        
        const booking = await processBookingPaymentAndIssueTicket({paystackRef, seatIds});
        await sendEmail(
            'bookingConfirmation',
            booking.email,
            {
                name: booking.passengerName,
                bookingToken: booking.bookingToken,
                link: `${process.env.APP_URL}/api/tickets/${booking.bookingToken}`,
                isSplitPayment: booking.isSplitPayment,
                amountPaid: booking.amountPaid,
                amountDue: booking.amountDue,
                origin: booking.trip.route.origin,
                destination: booking.trip.route.destination,
                departTime: booking.trip.departTime,
            }
        )
        res.status(200).json({
            message: 'Payment verified',
            ticketUrl: `${process.env.APP_URL}/api/tickets/${booking.bookingToken}`,
        });
    } catch (error) {
        console.error("🛑 Paystack Verify Error:", {
            paystackRef,
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
        });
        res.status(500).json({ message: 'Transaction initaialization failed', error: error?.response?.data || error.message})
    }
}

const handleGetAllPayments = async(req, res) => {
    const { search, sort, page =1, pageSize = 10 } = req.query;
    try {
        const payments = await getAllPayments({ 
            filter: { search }, 
            sort: sort ? JSON.parse(sort) : { createdAt: 'desc' }, 
            page: Number(page), 
            pageSize: Number(pageSize)
        });

        res.status(200).json({
            message: 'Payments retrieved successfully',
            status: 'success',
            data: payments
        });
    } catch (error) {
        console.error('Error retrieving payments:', error);
        res.status(500).json({ message: 'Failed to retrieve payments', error: error.message });
    }
}


const handleUpdatePayment = async (req, res) => {
  const { bookingToken, ...updateData } = req.body;

  if (!bookingToken) {
    return res.status(400).json({ message: "Missing bookingToken" });
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No update data provided" });
  }

  try {
    const updatedPayment = await updatePaymentService(bookingToken, updateData);
    return res.status(200).json({
      status: "success",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error.message);
    return res.status(500).json({
      message: "Error updating payment",
      error: error.message,
    });
  }
};

export {
    handlePaymentIntent,
    handleVerifyPayment,
    handleGetAllPayments,
    handleUpdatePayment
}