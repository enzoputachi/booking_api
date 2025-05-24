import {
  createRoute,
  deleteRoute,
  getRoute,
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

const handleGetRoute = async (req, res) => {
  try {
    const validatedRouteData = req.body;
    const routes = await getRoute(validatedRouteData);
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

const handleUpdateRoute = async (req, res) => {
  try {
    const validatedRouteData = req.body;
    const updatedRoutes = await updateRoute(validatedRouteData);
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
    const validatedRouteData = req.body;
    const routes = await deleteRoute(validatedRouteData);
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
  handleGetRoute,
  handleUpdateRoute,
  handleDeleteRoute,
};
