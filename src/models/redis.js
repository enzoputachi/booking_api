import Redis from "ioredis";
// @ts-ignore
import Redlock from 'redlock';
import dotenv from 'dotenv';
import pathFinder from "../utils/pathFinder.js";
dotenv.config();
pathFinder();


export const redis = new Redis(process.env.REDIS_URL);

redis.on("error", (err) => {
  console.error("[Redis Error]", err);
});

export const redlock = new Redlock([redis],{
    retryCount: 3,
    retryDelay: 200,
    retryJitter: 50,
    driftFactor: 0.01,
});

redlock.on("clientError", (err) => {
  console.error("[Redlock Client Error]", err);
  // This is a common error if the underlying Redis client connection drops,
  // or if Redlock can't acquire a lock after retries.
});

export async function testRedisConnection() {
  try {
    await redis.set('test_key', 'Hello from Render Redis!');
    const value = await redis.get('test_key');
    console.log(`Successfully set and retrieved value: ${value}`);
  } catch (error) {
    console.error("Failed to perform Redis operation:", error);
  }
}