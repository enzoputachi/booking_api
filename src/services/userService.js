import prisma from "../models/index.js";

const createUser = async(validatedUserdata) => {
    return await prisma.user.create({ data: validatedUserdata })
}

const getAllUsers = async() => {
    return await prisma.user.findMany();
}

const getUserById = async(userId) => {
    if (!userId) return null;

    return await prisma.user.findUnique({
        where: {id: userId}
    })
}


const updateUser = async(updatedData, userId ) => {
    return await prisma.user.update({
        where: { id: userId },
        data: updatedData,
    })
}


const deleteUser = async(userId) => {
    return await prisma.user.delete({
        where: { id: userId }
    })
}

export {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
}