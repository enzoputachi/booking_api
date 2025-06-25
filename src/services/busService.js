import prisma from "../models/index.js";

const createBus = async(validatedBusdata, db = prisma) => {
    return await db.bus.create({ data: validatedBusdata })
}

const getAllBuses = async(db = prisma) => {
    return await db.bus.findMany();
}

const getBusbyId = async(busId = '', db = prisma) => {
    if (!busId) return null;

    return await db.bus.findUnique({
        where: {id: busId}
    })
}


const updateBus = async({busId, updateData}, db = prisma) => {
    return await db.bus.update({
        where: { id: busId },
        data: updateData,
    })
}


const deleteBus = async(busId, db = prisma) => {
    return await db.bus.delete({
        where: { id: busId }
    })
}

export {
    createBus,
    getAllBuses,
    updateBus,
    deleteBus,
    getBusbyId
}