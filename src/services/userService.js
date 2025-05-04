import prisma from "../models/index.js";

const createUser = async(validatedUserdata) => {
    return await prisma.user.create({ data: validatedUserdata })
}

const getUser = async(userId = '') => {

    if (userId) {
        return await prisma.user.findUnique({
            where: {id: userId}
        })
    }

    return await prisma.user.findMany();
}


const updateUser = async(userId, data) => {
    return await prisma.user.update({
        where: { id: userId },
        data,
    })
}


const deleteUser = async(userId) => {
    return await prisma.user.delete({
        where: { id: userId }
    })
}

export {
    createUser,
    getUser,
    updateUser,
    deleteUser,
}