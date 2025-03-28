import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const cache = {
	async get(key) {
		try {
			const value = await redis.get(key);
			return value;
		} catch (error) {
			console.error("Cache get error:", error);
			return null;
		}
	},

	async set(key, value, expiryInSeconds = 300) {
		try {
			await redis.set(key, value, "EX", expiryInSeconds);
			return true;
		} catch (error) {
			console.error("Cache set error:", error);
			return false;
		}
	},

	async del(key) {
		try {
			await redis.del(key);
			return true;
		} catch (error) {
			console.error("Cache delete error:", error);
			return false;
		}
	},

	async flush() {
		try {
			await redis.flushall();
			return true;
		} catch (error) {
			console.error("Cache flush error:", error);
			return false;
		}
	},

	getClient() {
		return redis;
	},
};
