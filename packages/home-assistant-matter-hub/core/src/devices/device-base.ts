import { MatterDevice } from '@home-assistant-matter-hub/shared-interfaces';
import { createDefaultGroupsClusterServer, createDefaultScenesClusterServer } from '@project-chip/matter.js/cluster';
import type { Attributes, AttributeServers } from '@project-chip/matter.js/cluster';
import { Device, DeviceTypeDefinition } from '@project-chip/matter.js/device';

import { AspectBase, BasicInformationAspect } from '../aspects/index.js';
import { HomeAssistantMatterEntity } from '../models/index.js';

export interface DeviceBaseConfig {
  readonly vendorId: number;
  readonly vendorName: string;
}

export type DeviceConstructor = (entity: HomeAssistantMatterEntity, definition: DeviceTypeDefinition) => Device;

export abstract class DeviceBase implements MatterDevice {
  public static setDeviceConstructor(ctr: DeviceConstructor): void {
    this.deviceConstructor = ctr;
  }

  private static deviceConstructor: DeviceConstructor;

  public readonly domain: string;
  public readonly entityId: string;
  public readonly friendlyName: string;
  public readonly registered = true;

  public get deviceType(): string {
    return this.matter.getDeviceTypes()[0].name;
  }

  public get currentState(): Record<string, object> {
    return Object.fromEntries(
      this.matter
        .getAllClusterServers()
        .map((clusterServer) => [clusterServer.name, this.getClusterServerAttributes(clusterServer.attributes)]),
    );
  }

  public readonly matter: Device;
  private readonly aspects: AspectBase[] = [];

  protected constructor(entity: HomeAssistantMatterEntity, definition: DeviceTypeDefinition, config: DeviceBaseConfig) {
    this.domain = entity.domain;
    this.entityId = entity.entity_id;
    this.friendlyName = entity.attributes.friendly_name ?? entity.entity_id;

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

  private getClusterServerAttributes(attributes: AttributeServers<Attributes>): object {
    return Object.fromEntries(Object.entries(attributes).map(([key, attribute]) => [key, attribute.getLocal()]));
  }
}
