import prisma from "../models/index.js";

/**
 * Try to acquire the singleton lock.
 *
 * @param {string} jobName – must match the `name` in singleton_job.
 * @param {number} staleTimeoutMs – how old a lock can be before we consider it stale.
 * @returns {Promise<boolean>} – true if lock acquired, false otherwise.
 */

export const tryAcquireLock = async(jobName, staleTimeoutMs) => {
    const staleThreshold = new Date(Date.now() - staleTimeoutMs);

    // Ensure the lock row exist
    await prisma.singletonJob.upsert({
      where: { name: jobName },
      update: {},
      create: { name: jobName, lockedAt: null },
    })

    // Attempt the atomic update
    const { count } = await prisma.singletonJob.updateMany({
        where: {
            name: jobName,
            OR: [
                { lockedAt: null },
                { lockedAt: { lt: staleThreshold } },
            ],
        },
        data: { lockedAt: new Date() }
    });

    return count === 1;
}



/**
 * Release the singleton lock.
 *
 * @param {string} jobName
 * @returns {Promise<void>}
 */
export async function releaseLock(jobName) {
  await prisma.singletonJob.update({
    where: { name: jobName },
    data: { lockedAt: null },
  });
}
