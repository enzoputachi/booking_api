import {
  createBus,
  deleteBus,
  getBus,
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
    console.error("Error creating data:", error?.bus?.data || error.message);
    res.status(500).json({
      message: "Error creating bus",
      error: error?.bus?.data || error.message,
    });
  }
};

const handleGetBus = async (req, res) => {
  try {
    const validatedBusData = req.body;
    const buses = await getBus(validatedBusData);
    res.status(200).json({
      status: "success",
      data: buses,
    });
  } catch (error) {
    console.error("Error fetching bus:", error?.buses?.data || error.message);
    res.status(500).json({
      message: "Error fetching bus",
      error: error?.buses?.data || error.message,
    });
  }
};

const handleUpdateBus = async (req, res) => {
  try {
    const validatedBusData = req.body;
    const updatedBus = await updateBus(validatedBusData);
    res.status(200).json({
      status: "success",
      data: updatedBus,
    });
  } catch (error) {
    console.error(
      "Error updating bus:",
      error?.updatedbus?.data || error.message
    );
    res.status(500).json({
      message: "Error updating bus",
      error: error?.updatedbus?.data || error.message,
    });
  }
};

const handleDeleteBus = async (req, res) => {
  try {
    const validatedBusData = req.body;
    const bus = await deleteBus(validatedBusData);
    res.status(200).json({
      message: "bus deleted successfully",
      status: "success",
      data: Bus,
    });
  } catch (error) {
    console.error("Error deleting bus:", error?.bus?.data || error.message);
    res.status(500).json({
      message: "Error deleting bus",
      error: error?.bus?.data || error.message,
    });
  }
};

export { handleCreateBus, handleGetBus, handleUpdateBus, handleDeleteBus };
