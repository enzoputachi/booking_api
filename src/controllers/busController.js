import {
  createBus,
  deleteBus,
  getAllBuses,
  getBusbyId,
  updateBus,
} from "../services/busService.js";

const handleCreateBus = async (req, res) => {
  try {
    const validatedBusData = req.body;
    const bus = await createBus(validatedBusData);
    res.status(200).json({
      message: "bus created successfully ",
      status: "success",
      data: bus,
    });
  } catch (error) {
    console.error("Error creating data:", error.message);
    res.status(500).json({
      message: "Error creating bus",
      error: error.message,
    });
  }
};

const handleGetAllBuses = async (req, res) => {
  try {

    const buses = await getAllBuses();
    res.status(200).json({
      status: "success",
      data: buses,
    });
  } catch (error) {
    console.error("Error fetching bus:", error.message);
    res.status(500).json({
      message: "Error fetching bus",
      error: error.message,
    });
  }
};

const handleGetBusById = async (req, res) => {
  try {
    const busId =  parseInt(req.params.busId, 10);

    const bus = await getBusbyId(busId);
    res.status(200).json({
      status: "success",
      data: bus,
    });
  } catch (error) {
    console.error("Error fetching bus:", error.message);
    res.status(500).json({
      message: "Error fetching bus",
      error: error.message,
    });
  }
};

const handleUpdateBus = async (req, res) => {
  try {
    const busId =  parseInt(req.params.busId, 10);
    const updateData = req.body;

    const updatedBus = await updateBus({busId, updateData});
    res.status(200).json({
      status: "success",
      data: updatedBus,
    });
  } catch (error) {
    console.error(
      "Error updating bus:", error.message
    );
    res.status(500).json({
      message: "Error updating bus",
      error:  error.message,
    });
  }
};

const handleDeleteBus = async (req, res) => {
  try {
    const busId =  parseInt(req.params.busId, 10);

    const bus = await deleteBus( busId );
    res.status(200).json({
      message: "bus deleted successfully",
      status: "success",
      data: bus,
    });
  } catch (error) {
    console.error("Error deleting bus:", error.message);
    res.status(500).json({
      message: "Error deleting bus",
      error: error.message,
    });
  }
};

export { handleCreateBus, handleGetAllBuses, handleGetBusById, handleUpdateBus, handleDeleteBus };
