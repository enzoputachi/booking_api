import prisma from "../models/index.js";
import { generateToken } from "../utils/tokenUtils.js";
import { comparePassword, hashPassword } from './../utils/hashUtils.js';

const createUser = async(validatedUserdata) => {
    const { name, email, password } = validatedUserdata;

    const userExists = await prisma.user.findUnique({
        where: { email: email }
    });

    if (userExists) {
        throw new Error('User already exists with this email');
    }
    
    const hashedPassword = await hashPassword(password);


    // You can add more validation logic here if needed
    const newUser = await prisma.user.create({ data: { name, email, password: hashedPassword } })

    const token = await generateToken(newUser.id, newUser.role);

    return {
        user: newUser,
        token: token
    };
}

const loginUser = async(email, password) => {
    const user = await prisma.user.findUnique({
        where: { email: email }
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    })

    const token = generateToken(user.id, user.role);

    return {
        user,
        token
    };
}

const getCurrentUser = async(userId) => {
    if (!userId) return null;

    return await prisma.user.findUnique({
        where: { id: userId }
    });
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
    loginUser,
    getCurrentUser,
}