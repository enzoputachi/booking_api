import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pathFinder from '../utils/pathFinder.js';
dotenv.config();

pathFinder()


export const authenticate = async(req, res, next) => {
    let token;

    token = req.headers["authorization"]?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided.'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401);
        throw new Error(`Not authorized, token failed: ${error.message}`);
    }
}

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied: Admins only' })
}