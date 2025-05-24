import {
  createSeat,
  deleteSeat,
  getSeatById,
  updateSeat,
} from "../services/seatService.js";

const handleCreateSeat = async (req, res) => {
  try {
    const validatedSeatData = req.body;
    const seat = await createSeat(validatedSeatData);
    res.status(200).json({
      message: "Seat created successfully ",
      status: "success",
      data: seat,
    });
  } catch (error) {
    console.error("Error creating seat:", error?.seat?.data || error.message);
    res.status(500).json({
      message: "Error creating seat",
      error: error?.seat?.data || error.message,
    });
  }
};

const handleGetSeat = async (req, res) => {
  try {
    const validatedSeatData = req.body;
    const seat = await getSeatById(validatedSeatData);
    res.status(200).json({
      status: "success",
      data: seat,
    });
  } catch (error) {
    console.error("Error fetching seat:", error?.seat?.data || error.message);
    res.status(500).json({
      message: "Error fetching seat",
      error: error?.seat?.data || error.message,
    });
  }
};

const handleUpdateSeat = async (req, res) => {
  try {
    const validatedSeatData = req.body;
    const updatedSeat = await updateSeat(validatedSeatData);
    res.status(200).json({
      status: "success",
      data: updatedSeat,
    });
  } catch (error) {
    console.error(
      "Error updating seat:",
      error?.updatedSeat?.data || error.message
    );
    res.status(500).json({
      message: "Error updating seat",
      error: error?.updatedSeat?.data || error.message,
    });
  }
};

const handleDeleteSeat = async (req, res) => {
  try {
    const validatedSeatData = req.body;
    const seat = await deleteSeat(validatedSeatData);
    res.status(200).json({
      message: "Seat deleted successfully",
      status: "success",
      data: seat,
    });
  } catch (error) {
    console.error("Error deleting seat:", error?.seat?.data || error.message);
    res.status(500).json({
      message: "Error deleting seat",
      error: error?.seat?.data || error.message,
    });
  }
};

export { handleCreateSeat, handleGetSeat, handleUpdateSeat, handleDeleteSeat };
