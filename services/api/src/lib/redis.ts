import IORedis from "ioredis"

export const redis = new IORedis(process.env.REDIS_URL ?? "redis://:jay_redis_password@localhost:6379")
