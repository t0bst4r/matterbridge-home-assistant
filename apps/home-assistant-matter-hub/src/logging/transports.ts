import { format, transports } from 'winston';

export const ConsoleTransport = new transports.Console({
  level: process.env.LOG_LEVEL ?? 'info',
  format: format.combine(
    format.colorize({ all: true }),
    format.printf((info) => {
      const { level, message, service, entityId, aspect, hint, timestamp } = info;
      const name = [service, entityId, aspect].filter((it) => it != undefined).join(' / ');
      const text = `${message}${hint ? `\n${hint}` : ''}`;
      return `[${timestamp}] [${name}] [${level}] ${text}`;
    }),
  ),
});
