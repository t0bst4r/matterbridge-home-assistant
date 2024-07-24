import { DeviceTypeDefinition, MatterbridgeDevice } from 'matterbridge';

import { AspectBase, BasicInformationAspect } from '@/aspects/index.js';
import { logger } from '@/logging/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

export interface DeviceBaseConfig {
  readonly vendorId?: number;
  readonly vendorName?: string;
}

export abstract class DeviceBase {
  public readonly entityId: string;
  public readonly matter: MatterbridgeDevice;
  private readonly aspects: AspectBase[] = [];

  protected constructor(entity: HomeAssistantMatterEntity, definition: DeviceTypeDefinition, config: DeviceBaseConfig) {
    this.entityId = entity.entity_id;
    this.matter = new MatterbridgeDevice(definition);
    this.matter.log.setLogDebug(logger.isDebugEnabled());
    this.matter.log.setLogName(this.entityId);

    this.matter.createDefaultGroupsClusterServer();
    this.matter.createDefaultScenesClusterServer();
    this.addAspect(
      new BasicInformationAspect(this.matter, entity, {
        vendorId: config.vendorId ?? 0x0000,
        vendorName: config.vendorName ?? 't0bst4r',
      }),
    );
  }

  public addAspect(aspect: AspectBase): void {
    this.aspects.push(aspect);
  }

  public async updateState(state: HomeAssistantMatterEntity): Promise<void> {
    for (const aspect of this.aspects) {
      await aspect.update(state);
    }
  }
}
