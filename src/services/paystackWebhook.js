import crypto from "crypto";
// import { Request } from "express";
import dotenv from "dotenv";
import pathFinder from "../utils/pathFinder.js";
dotenv.config();
pathFinder();

const PAYSTACK_LIVE_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

const verifySignature = (req) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_LIVE_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return hash === req.headers["x-paystack-signature"];
};

const processPaymentEvent = async (paymentData) => {    
  console.log("Process payment event for reference: ", paymentData.reference);

  try {
    const paystackRef = paymentData.reference;
    const updated = await db.payment.update({
        where: { paystackRef },
        data: {
        status: 'PAID',
        paidAt: new Date(data.paid_at),
        amount: data.amount,
        channel: data.channel || null,
        currency: data.currency,
        authorization: data.authorization || null,
        customerId: data.customer?.customer_code || null
        },
    });

    console.log('Payment updated successfully:', updated);
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error; 
  }
};


export {
  verifySignature,
  processPaymentEvent
}
