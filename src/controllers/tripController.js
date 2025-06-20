import { deleteSeat } from "../services/seatService.js";
import {
  createTrip,
  deleteTrip,
  findAvailableTrips,
  getAllTrips,
  getTripById,
  updateTrip,
  validateBookableTrip,
} from "../services/tripService.js";

const handleCreateTrip = async (req, res) => {
  try {
    const validatedTripData = req.body;
    const trip = await createTrip(validatedTripData);
    res.status(201).json({
      message: "trip created successfully ",
      status: "success",
      data: trip,
    });
  } catch (error) {
    console.error("Error creating trip:", error.message);
    res.status(500).json({
      message: "Error creating trip",
      error: error.message,
    });
  }
};

const handleGetTripById = async (req, res) => {
  try {
    const tripId =  parseInt(req.params.tripId, 10); 

    const trip = await getTripById(tripId);
    res.status(200).json({
      status: "success",
      data: trip,
    });
  } catch (error) {
    console.error("Error fetching trip:", error.message);
    res.status(500).json({
      message: "Error fetching trip",
      error: error.message,
    });
  }
};


const handleGetAllTrips = async (req, res) => {
  try {
    const trips = await getAllTrips();
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
    const tripId =  parseInt(req.params.tripId, 10);
    const validatedTripData = req.body;

    const updatedtrips = await updateTrip(tripId, validatedTripData);
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
    const tripId =  parseInt(req.params.tripId, 10);

    // await deleteSeat(tripId)

    const trips = await deleteTrip(tripId);

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

// ================================================ //
//                      USER-FACING FEATURES       //
//================================================ //


const handleSearchTripsByRoute = async(req, res) => {
  try {
    const { origin, destination, date } = req.query;

    if (!origin || !destination ) {
      return res.status(400).json({
          status: 'error',
          message: 'Missing required parameters: origin, destination, and date are required.',
      });
    }

    const trips = await findAvailableTrips({ origin, destination, date })
   
    if (!trips) return 'hit'
    

    res.status(200).json({
      status: 'success',
      data: trips,
    });
  } catch (error) {
    console.error("Error searching for trip", error.message);
    res.status(500).json({
      message:  "Error searching for trips",
      error: error.message,
    });
  }
}


const handleValidateTripDetails = async(req, res) => {
  try {
     const tripId =  parseInt(req.params.tripId, 10); 

     const validatedTrip = await validateBookableTrip(tripId);
     console.log("Trip details res:", validatedTrip);
     
     res.status(200).json({
      status: 'success',
      data: validatedTrip,
     })
  } catch (error) {
    console.error("Error fetching trip:", error.message);
    res.status(500).json({
      message: "Error fetching trip",
      error: error.message,
    });
  }
}

export {
  handleCreateTrip,
  handleGetTripById,
  handleGetAllTrips,
  handleUpdateTrip,
  handleDeleteTrip,
  handleSearchTripsByRoute,
  handleValidateTripDetails,
};
