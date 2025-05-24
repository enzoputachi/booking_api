import {
  createTrip,
  deleteTrip,
  getTrip,
  updateTrip,
} from "../services/tripService.js";

const handleCreateTrip = async (req, res) => {
  try {
    const validatedTripData = req.body;
    const trip = await createTrip(validatedTripData);
    res.status(200).json({
      message: "trip created successfully ",
      status: "success",
      data: trip,
    });
  } catch (error) {
    console.error("Error creating trip:", error?.trip?.data || error.message);
    res.status(500).json({
      message: "Error creating trip",
      error: error?.trip?.data || error.message,
    });
  }
};

const handleGetTrip = async (req, res) => {
  try {
    const validatedTripData = req.body;
    const trips = await getTrip(validatedTripData);
    res.status(200).json({
      status: "success",
      data: trips,
    });
  } catch (error) {
    console.error("Error fetching trip:", error?.trips?.data || error.message);
    res.status(500).json({
      message: "Error fetching trip",
      error: error?.trips?.data || error.message,
    });
  }
};

const handleUpdateTrip = async (req, res) => {
  try {
    const validatedTripData = req.body;
    const updatedtrips = await updateTrip(validatedTripData);
    res.status(200).json({
      status: "success",
      data: updatedtrips,
    });
  } catch (error) {
    console.error(
      "Error updating trip:",
      error?.updatedtrips?.data || error.message
    );
    res.status(500).json({
      message: "Error updating trip",
      error: error?.updatedtrips?.data || error.message,
    });
  }
};

const handleDeleteTrip = async (req, res) => {
  try {
    const validatedTripData = req.body;
    const trips = await deleteTrip(validatedTripData);
    res.status(200).json({
      message: "trip deleted successfully",
      status: "success",
      data: trips,
    });
  } catch (error) {
    console.error("Error deleting trip:", error?.trips?.data || error.message);
    res.status(500).json({
      message: "Error deleting trip",
      error: error?.trips?.data || error.message,
    });
  }
};

export { handleCreateTrip, handleGetTrip, handleUpdateTrip, handleDeleteTrip };
