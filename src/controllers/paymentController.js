import { number } from "zod/v4";
import { processBookingPaymentAndIssueTicket } from "../services/bookingOrchestrator.js";
import { createPaymentIntent, getAllPayments, verifyPayment } from "../services/paymentService.js";



const handlePaymentIntent = async(req, res) => {
    const { email, amount, bookingId, channel } = req.body;

    try {
        const payment = await createPaymentIntent({email, amount, bookingId, channel})

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
    const { reference: paystackRef } = req.params;

    try {
        
        const { downloadUrl, booking } = await processBookingPaymentAndIssueTicket(paystackRef);

        res.status(201).json({
            message: 'Payment verified; ticket generated',
            status: 'success',
            ticketUrl: downloadUrl,
            data: booking
        })
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

export {
    handlePaymentIntent,
    handleVerifyPayment,
    handleGetAllPayments,
}