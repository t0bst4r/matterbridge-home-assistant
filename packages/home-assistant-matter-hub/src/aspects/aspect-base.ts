import { logger, type Logger } from '@/logging/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

export abstract class AspectBase {
  protected readonly baseLogger: Logger;

  abstract update(state: HomeAssistantMatterEntity): Promise<void>;

  protected readonly entityId: string;

  protected constructor(entity: HomeAssistantMatterEntity) {
    this.baseLogger = logger.child({ entityId: entity.entity_id });
    this.entityId = entity.entity_id;
  }
}
