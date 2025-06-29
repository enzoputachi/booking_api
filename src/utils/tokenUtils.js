import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pathFinder from './pathFinder.js';
dotenv.config();

pathFinder();

// console.log("SEECRET KEY", process.env.JWT_SECRET);


export const generateToken = async (id, role) => {
    const payload = { id, role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '30d'
    }); 

    return token;
}