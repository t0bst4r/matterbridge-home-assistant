import { Logger } from '@project-chip/matter.js/log';
import Transport from 'winston-transport';

export class MatterLoggerTransport extends Transport {
  constructor() {
    super({ level: 'debug' });
  }

  log(info: Record<string, string>, next: () => void) {
    const { level, message, service, entityId, aspect, hint } = info;
    const name = [service, entityId, aspect].filter((it) => it != undefined).join(' / ');
    const text = `${message}${hint ? `\n${hint}` : ''}`;

    const logger = this.logFn(Logger.get(name), level);
    logger(text);
    next();
  }
  private logFn(logger: Logger, level: string): (text: string) => void {
    switch (level) {
      case 'warn':
        return logger.warn;
      case 'error':
        return logger.error;
      case 'info':
        return logger.info;
      case 'debug':
        return logger.debug;
      case 'fatal':
        return logger.fatal;
      case 'notice':
        return logger.notice;
      default:
        return logger.warn;
    }
  }
}
