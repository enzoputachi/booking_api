const handleUpdateBooking = async (req, res) => {
  // Note camelCase here
  const { bookingToken, ...updateData } = req.query;

  if (!bookingToken) {
    return res.status(400).json({ message: "Missing bookingToken" });
  }

  try {
    const updatedBooking = await updateBookingService(bookingToken, updateData);
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

const handleUpdatePayment = async (req, res) => {
  const { bookingToken, ...updateData } = req.query;

  if (!bookingToken) {
    return res.status(400).json({ message: "Missing bookingToken" });
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
