import redis from 'ioredis'

// const redisClient = new redis(6379, "34.28.116.231");
const redisClient = new redis();

export default redisClient;