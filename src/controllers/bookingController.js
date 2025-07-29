import { createBookingDraft, getAllBookings, getbookingByToken, listBooking, retrieveBooking, updateBookingService } from "../services/bookingService.js";
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
        const bookings = await getAllBookings()

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

const handleUpdateBooking = async (req, res) => {
  const {
    bookingToken,
    autoAssignSeats = true,
    requiredSeats = 1,
    ...updateData
  } = req.body;

  if (!bookingToken) {
    return res.status(400).json({ message: "Missing bookingToken" });
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No update data provided" });
  }

  try {
    const updatedBooking = await updateBookingService(
      bookingToken,
      updateData,
      { autoAssignSeats, requiredSeats }
    );
    return res.status(200).json({
      status: "success",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error.message);
    return res.status(500).json({
      message: "Error updating booking",
      error: error.message,
    });
  }
};

export const handleConfirmBookingByToken = async (req, res) => {
    const { bookingToken } = req.query;
    console.log("Booking details:", bookingToken)

    try {
      const booking = await retrieveBooking(bookingToken);

      return res.status(200).json({
        message: "Booking retrieved successfully",
        booking,
      });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
}

export {
    handleCreateBookingDraft,
    handleListBookings,
    handleGetBookingByToken,
    handleUpdateBooking,
}