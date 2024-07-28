import { AnsiLogger, LogLevel, TimestampFormat } from 'matterbridge/logger';
import Transport from 'winston-transport';

const logLevels: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
};

export class NodeAnsiTransport extends Transport {
  private readonly ansiLogger: AnsiLogger;

  constructor(private readonly rootLogger: AnsiLogger) {
    super({ level: 'debug' });
    this.ansiLogger = new AnsiLogger({ logTimestampFormat: TimestampFormat.TIME_MILLIS });
  }

  log(info: Record<string, string>, next: () => void) {
    const { level, message, service, entityId, aspect, hint } = info;
    const name = [service, entityId, aspect].filter((it) => it != undefined).join(' / ');
    const text = `${message}${hint ? `\n${hint}` : ''}`;

    this.ansiLogger.logLevel = this.rootLogger.logLevel;
    this.ansiLogger.logName = name;
    this.ansiLogger.log(this.calcLogLevel(level), text);
    next();
  }

  private calcLogLevel(level: string): LogLevel {
    return logLevels[level] ?? LogLevel.WARN;
  }
}
