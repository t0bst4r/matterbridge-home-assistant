import { createDefaultGroupsClusterServer, createDefaultScenesClusterServer } from '@project-chip/matter.js/cluster';
import { DeviceTypeDefinition } from '@project-chip/matter.js/device';

import { AspectBase, BasicInformationAspect } from '@/aspects/index.js';
import { MatterDevice } from '@/devices/matter-device.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

export interface DeviceBaseConfig {
  readonly vendorId: number;
  readonly vendorName: string;
}

export type DeviceConstructor = (entity: HomeAssistantMatterEntity, definition: DeviceTypeDefinition) => MatterDevice;

export abstract class DeviceBase {
  public static setDeviceConstructor(ctr: DeviceConstructor): void {
    this.deviceConstructor = ctr;
  }

  private static deviceConstructor: DeviceConstructor;

  public readonly entityId: string;
  public readonly matter: MatterDevice;
  private readonly aspects: AspectBase[] = [];

  protected constructor(entity: HomeAssistantMatterEntity, definition: DeviceTypeDefinition, config: DeviceBaseConfig) {
    this.entityId = entity.entity_id;
    this.matter = DeviceBase.deviceConstructor(entity, definition);

    this.matter.addClusterServer(createDefaultGroupsClusterServer());
    this.matter.addClusterServer(createDefaultScenesClusterServer());

    this.addAspect(
      new BasicInformationAspect(this.matter, entity, {
        vendorId: config.vendorId,
        vendorName: config.vendorName,
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
