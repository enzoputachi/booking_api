import { createBookingDraft, getbookingByToken, listBooking } from "../services/bookingService.js";
import { hashContact } from "../utils/bookingUtils.js";


const handleCreateBookingDraft = async(req, res) => {
    try {
        const { email, mobile, ...rest } = req.body;
        const contactHash  = await hashContact(email, mobile)        

        const draftPaylod = { email, mobile, contactHash, ...rest };
        // console.log("booking response:", draftPaylod);
        const booking = await createBookingDraft(draftPaylod);

        // console.log("booking response:", booking);

        res.status(200).json({
            message: "Booking draft created successfully",
            status: "success",
            data: booking,
        });
    } catch (error) {
        console.log("Request body:", req.body);
        
        console.error("Error creating booking:", error.message);
        res.status(500).json({
        message: "Booking creation failed:",
        error: error.message,
        });
    }
}

const handleListBookings = async(req, res) => {
    try {
        const bookings = await listBooking()

        res.status(200).json({
            status: "success",
            data: bookings,
        });
    } catch (error) {
        console.error("Error fetching booking:", error.message);
        res.status(500).json({
        message: "Booking fetching failed:",
        error: error.message,
        });
    }
}

const handleGetBookingByToken = async(req, res) => {
    try {
        const bookingToken = req.params;
        const booking = await getbookingByToken(bookingToken);

        res.status(200).json({
            status: "success",
            data: booking,
        });
    } catch (error) {
        console.error("Error fetching booking:", error.message)
        res.status(500).json({
            message: "Booking fetching failed.",
            error: error.message,
        })
    }
}

export {
    handleCreateBookingDraft,
    handleListBookings,
    handleGetBookingByToken,
}