import prisma from "../models/index.js";

const createBus = async(validatedBusdata) => {
    return await prisma.bus.create({ data: validatedBusdata })
}

const getBus = async(busId = '') => {

    if (busId) {
        return await prisma.bus.findUnique({
            where: {id: busId}
        })
    }

    return await prisma.bus.findMany();
}


const updateBus = async(busId, data) => {
    return await prisma.bus.update({
        where: { id: busId },
        data,
    })
}


const deleteBus = async(busId) => {
    return await prisma.bus.delete({
        where: { id: busId }
    })
}

export {
    createBus,
    getBus,
    updateBus,
    deleteBus,
}