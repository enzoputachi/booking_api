import { sendEmail } from "../services/mailService.js";
import { retrieveBooking } from "../services/retrieveBooking.js";


export const handleRetrieveBooking = async (req, res) => {
    const { bookingToken, email } = req.query;
    console.log("Booking details:", bookingToken, email)

    try {
        const booking = await retrieveBooking(bookingToken);        
         await sendEmail("bookingConfirmation", booking.email, {
           name: booking.passengerName,
           bookingToken: booking.bookingToken,
           link: `${process.env.APP_URL}/api/tickets/${booking.bookingToken}`,
           isSplitPayment: booking.isSplitPayment,
           amountPaid: booking.amountPaid,
           amountDue: booking.amountDue,
           origin: booking.trip.route.origin,
           destination: booking.trip.route.destination,
           departTime: booking.trip.departTime,
         });

         return res.status(200).json({
           message: "Booking retrieved successfully",
           booking,
         });
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message });
    }
}