import { Logger } from 'winston';
import { logger } from '../../logger.js';

export abstract class MatterAspect<TState> {
  protected readonly log: Logger;

  abstract update(state: TState): Promise<void>;

  protected constructor(logName: string) {
    this.log = logger.child({ service: logName });
  }
}
