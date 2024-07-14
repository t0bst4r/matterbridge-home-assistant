import { format, transports } from 'winston';

export const consoleLogger = (logLevel: string) =>
  new transports.Console({
    level: logLevel,
    format: format.combine(
      format.colorize({
        all: true,
        colors: {
          info: 'blue',
          warn: 'yellow',
          error: 'red',
          debug: 'green',
        },
      }),
      format.printf(({ level, message, timestamp, service, entityId, aspect, hint }) => {
        const prefix = [timestamp, pad(level, 5), pad(service, 25), pad(entityId, 25), pad(aspect, 20)]
          .filter((it) => it != undefined)
          .map((it) => `[ ${it} ]`)
          .join(' ');
        return `${prefix} ${message}${hint ? `\n${hint}` : ''}`;
      }),
    ),
  });

function pad(text: string | undefined, minLength: number): string | undefined {
  if (text == null) {
    return text;
  }
  return text + ' '.repeat(Math.max(0, minLength - text.length));
}
