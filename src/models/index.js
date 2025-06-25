import { PrismaClient, PaymentStatus } from "../../prisma/src/generated/prisma/index.js";

const prisma = new PrismaClient({
    log: [
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
    ]
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

export default prisma;