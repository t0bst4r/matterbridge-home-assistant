import { AnsiLogger, TimestampFormat } from 'node-ansi-logger';

export abstract class MatterAspect<TState> {
  protected readonly log: AnsiLogger = new AnsiLogger({
    logName: 'MatterAspect',
    logTimestampFormat: TimestampFormat.TIME_MILLIS,
    logDebug: process.env.LOG_DEBUG === 'true',
  });
  abstract update(state: TState): Promise<void>;

  protected constructor(protected readonly entityId: string) {}
}
