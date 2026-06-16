import Redis from "ioredis";
import {env} from "../../src/shared/env/env";

const redis = new Redis({
    host: env.REDIS_HOST || 'locahost',
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    retryStrategy: (times) => Math.min(times * 100,3000),
})

redis.on('connect',() => console.log('[Redis] Connected'));
redis.on('error', (error: Error) => console.error(`[Redis] Error:${error}`))


export default redis;