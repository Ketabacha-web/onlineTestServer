import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
//   defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export { logger as Log };
