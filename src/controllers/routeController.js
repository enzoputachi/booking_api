import {
  createRoute,
  deleteRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
} from "../services/routeService.js";

const handleCreateRoute = async (req, res) => {
  try {
    const validatedRouteData = req.body;
    const route = await createRoute(validatedRouteData);
    res.status(200).json({
      message: "Route created successfully ",
      status: "success",
      data: route,
    });
  } catch (error) {
    console.error("Error creating data:", error?.route?.data || error.message);
    res.status(500).json({
      message: "Error creating route",
      error: error?.route?.data || error.message,
    });
  }
};

const handleGetAllRoutes = async (req, res) => {
  try {
    const routes = await getAllRoutes();
    res.status(200).json({
      status: "success",
      data: routes,
    });
  } catch (error) {
    console.error(
      "Error fetching route:",
      error?.routes?.data || error.message
    );
    res.status(500).json({
      message: "Error fetching route",
      error: error?.routes?.data || error.message,
    });
  }
};


const handleGetRouteById = async (req, res) => {
  try {
    const routeId =  parseInt(req.params.routeId, 10);

    const route = await getRouteById( routeId );
    res.status(200).json({
      status: "success",
      data: route,
    });
  } catch (error) {
    console.error(
      "Error fetching route:",
      error?.route?.data || error.message
    );
    res.status(500).json({
      message: "Error fetching route",
      error: error?.route?.data || error.message,
    });
  }
};


const handleUpdateRoute = async (req, res) => {
  try {
    const routeId =  parseInt(req.params.routeId, 10);
    const updateData = req.body;

    const updatedRoutes = await updateRoute(routeId, updateData);
    res.status(200).json({
      status: "success",
      data: updatedRoutes,
    });
  } catch (error) {
    console.error(
      "Error updating route:",
      error?.updatedRoutes?.data || error.message
    );
    res.status(500).json({
      message: "Error updating route",
      error: error?.updatedRoutes?.data || error.message,
    });
  }
};

const handleDeleteRoute = async (req, res) => {
  try {
    const routeId =  parseInt(req.params.routeId, 10);
    const routes = await deleteRoute(routeId);
    res.status(200).json({
      message: "Route deleted successfully",
      status: "success",
      data: routes,
    });
  } catch (error) {
    console.error(
      "Error deleting route:",
      error?.routes?.data || error.message
    );
    res.status(500).json({
      message: "Error deleting route",
      error: error?.routes?.data || error.message,
    });
  }
};

export {
  handleCreateRoute,
  handleGetRouteById,
  handleGetAllRoutes,
  handleUpdateRoute,
  handleDeleteRoute,
};
