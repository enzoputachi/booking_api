import { PrismaClient, PaymentStatus } from "../../prisma/src/generated/prisma/index.js";
import dotenv from 'dotenv';
import pathFinder from "../utils/pathFinder.js";
dotenv.config()
pathFinder()

const prisma = new PrismaClient({
    log: [
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
    ],

    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

prisma.$on('info', (event) => {
    console.log(`[INFO] ${event.message}`);
    
})

prisma.$on('warn', (event) => {
    console.log(`[WARN] ${event.message}`);
    
})

prisma.$on('error', (event) => {
    console.log(`[ERROR] ${event.message}`);
    
})

// Add query logging to debug connection issues
prisma.$on('query', (event) => {
    console.log(`[QUERY ${new Date().toISOString()}] ${event.query} - Duration: ${event.duration}ms`);
});

export default prisma;