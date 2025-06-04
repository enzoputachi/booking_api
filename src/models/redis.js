// import Redis from "ioredis";
// // @ts-ignore
// // import Redlock from 'redlock';


// export const redis = new Redis();

// redis.on("error", (err) => {
//   console.error("[Redis Error]", err);
// });

// export const redlock = new Redlock([redis],{
//     retrycount: 3,
//     retryDelay: 200,
//     retryJitter: 50,
//     driftFactor: 0.01,
// })