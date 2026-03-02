import winston from 'winston';
import { config } from '../config';

export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    config.nodeEnv === 'development'
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...rest }) => {
            const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
            return `${timestamp} [${level}]: ${message}${extra}`;
          }),
        )
      : winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});
