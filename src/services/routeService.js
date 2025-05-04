import prisma from "../models/index.js";

/* origin      String
  destination String
  distanceKm  Float */

const createRoute = async(validatedRouteData) => {
    const route = await prisma.route.create({ data: validatedRouteData });
    return route;
}

const getRoute = async(routeId = '') => {

    if (routeId) {
        const route = await prisma.route.findUnique({
            where: { id: routeId }
        })

        return route;
    }

    const allRoutes = await prisma.route.findMany();
    return allRoutes;

}


const updateRoute = async(routeId, data) => {
    const updatedRoute = await prisma.route.update({
        where: { id: routeId },
        data,
    });

    return updatedRoute;
}

const deleteRoute = async(routeId) => {
    return await prisma.route.delete({
        where: { id: routeId}
    })
}


export { 
    createRoute, 
    getRoute,
    updateRoute,
    deleteRoute
}