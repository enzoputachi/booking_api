import Queue from 'bull';
import dotenv from 'dotenv';
dotenv.config()

const redisUrl = process.env.REDIS_URL;
export const sendTicketQueue = new Queue('send-ticket', redisUrl)

console.log('Resis URL:', redisUrl);

