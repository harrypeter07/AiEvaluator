import { LRUCache } from "lru-cache";

export function rateLimit({ interval, uniqueTokenPerInterval = 500 }) {
	const tokenCache = new LRUCache({
		max: uniqueTokenPerInterval,
		ttl: interval,
	});

	return {
		check: async (request, limit, token) => {
			const tokenCount = tokenCache.get(token) || [0];
			if (tokenCount[0] === 0) {
				tokenCache.set(token, tokenCount);
			}
			tokenCount[0] += 1;

			const currentUsage = tokenCount[0];
			const isRateLimited = currentUsage >= limit;

			if (isRateLimited) {
				throw new Error("Rate limit exceeded");
			}

			return {
				isRateLimited: false,
				currentUsage,
				remainingTokens: limit - currentUsage,
			};
		},
	};
}
