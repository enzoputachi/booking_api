import { tryAcquireLock, releaseLock } from "../utils/lock.js";
import { freeExpiredSeats } from "../jobs/freeExpiredSeats.js";

const JOB_NAME = 'free_expired_seats';

const STLE_TIMEOUT_MS = 5 * 60 * 1000;

export const runSingletonJob = async() => {
    const getLock = await tryAcquireLock(JOB_NAME, STLE_TIMEOUT_MS);

    if (!getLock) {
        console.log('Lock not acquired - another instance is running or it just ran');
        return { acquired: false, freed: 0 };
    }

    let freedCount = 0;
    try {
        freedCount = await freeExpiredSeats();
        return { acquired: true, freed: freedCount }
    } catch (error) {
        console.error('Job failed:', error);
        return { acquired: true, freed: freedCount, error: err.message };
    } finally {
        await releaseLock(JOB_NAME);
    }
}
