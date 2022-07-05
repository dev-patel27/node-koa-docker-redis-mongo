import { RateLimiterRedis } from "rate-limiter-flexible";
import { createClient } from "redis";

const redisClient = createClient({
  enable_offline_queue: false,
  host: "localhost",
  port: 6379,
});

const caching = async (ctx, next) => {
  await redisClient.connect();

  redisClient.on("error", (err) => {
    console.error("err::>>", err);
  });

  redisClient.on("connect", (res) => {
    console.log(res, "connected....");
  });

  const opts = {
    storeClient: redisClient,
    points: 5, // Number of points
    duration: 5, // Per second(s)
    // Custom
    blockDuration: 0, // Do not block if consumed more than points
    keyPrefix: "rlflx", // must be unique for limiters with different purpose
  };

  const rateLimiterRedis = new RateLimiterRedis(opts);
  rateLimiterRedis
    .consume(ctx.request.ip)
    .then((rateLimiterRes) => {
      console.log("rateLimiterRes::>>", rateLimiterRes);
      next();
      // ... Some app logic here ...
    })
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        // Some Redis error
        // Never happen if `insuranceLimiter` set up
        // Decide what to do with it in other case
      } else {
        // Can't consume
        // If there is no error, rateLimiterRedis promise rejected with number of ms before next request allowed
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        ctx.set = { "Retry-After": String(secs) };
        ctx.status = 429;
        ctx.body = "Too Many Requests";
      }
    });
};

export default caching;
