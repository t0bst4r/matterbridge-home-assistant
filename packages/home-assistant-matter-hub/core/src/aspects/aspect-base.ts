import type { Logger } from 'winston';

import { logger } from '../logging/index.js';
import { HomeAssistantMatterEntity } from '../models/index.js';

export abstract class AspectBase {
  protected readonly log: Logger;

  abstract update(state: HomeAssistantMatterEntity): Promise<void>;

  protected readonly entityId: string;

  protected constructor(name: string, entity: HomeAssistantMatterEntity) {
    this.log = logger.child({ aspect: name, entityId: entity.entity_id });
    this.entityId = entity.entity_id;
  }
}
