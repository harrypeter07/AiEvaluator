import winston from "winston";

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json(),
		winston.format.errors({ stack: true })
	),
	defaultMeta: { service: "classroom-api" },
	transports: [
		new winston.transports.File({
			filename: "logs/error.log",
			level: "error",
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
		new winston.transports.File({
			filename: "logs/combined.log",
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
	],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== "production") {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			),
		})
	);
}

// Add request context middleware
logger.addRequestContext = (req) => {
	return {
		requestId: req.headers["x-request-id"],
		method: req.method,
		url: req.url,
		userAgent: req.headers["user-agent"],
		ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
	};
};

// Add response context middleware
logger.addResponseContext = (res) => {
	return {
		statusCode: res.statusCode,
		responseTime: res.get("X-Response-Time"),
	};
};

export { logger };
