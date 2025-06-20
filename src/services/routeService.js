import prisma from "../models/index.js";

/* origin      String
  destination String
  distanceKm  Float */

const createRoute = async(validatedRouteData, db = prisma) => {
    const route = await db.route.create({ data: validatedRouteData });
    return route;
}

const getAllRoutes = async(db = prisma) => {

    const allRoutes = await db.route.findMany();
    return allRoutes;

}


const getRouteById = async(routeId, db = prisma) => {
    if (!routeId) return null;

    const route = await db.route.findUnique({
        where: { id: routeId }
    })

    return route;
}


const updateRoute = async(routeId, data, db = prisma) => {
    const updatedRoute = await db.route.update({
        where: { id: routeId },
        data,
    });

    return updatedRoute;
}

const deleteRoute = async(routeId, db = prisma) => {
    return await db.route.delete({
        where: { id: routeId}
    })
}


export { 
    createRoute, 
    getAllRoutes,
    getRouteById,
    updateRoute,
    deleteRoute
}