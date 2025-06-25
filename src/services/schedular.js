import cron from 'node-cron';
import { runSingletonJob } from './runSingletonJob.js';


// Cron expression: "every 5 minutes"
const CRON_SCHEDULE = '*/5 * * * *';

// Start the background schedular
export const startScheduler = async() => {
    console.log(`Starting scheduler: running job every 5 minutes (${CRON_SCHEDULE})`)

    cron.schedule(CRON_SCHEDULE, async() => {
        console.log(`[${new Date().toISOString()}] Triggering singleton job`);

        try {
            const result = await runSingletonJob();
            console.log(`[${new Date().toISOString()}] runSingletonJob() completed`, result);
            result;
        } catch (error) {
           console.error('Error executing singleton job:', err); 
        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });
}