import Redis from "ioredis";
// @ts-ignore
import Redlock from 'redlock';


export const redis = new Redis();
export const redlock = new Redlock([redis], {
    retrycount: 3,
    retryDelay: 200,
})