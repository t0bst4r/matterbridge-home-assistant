import { MatterEndpointDevice } from '@home-assistant-matter-hub/shared-interfaces';
import type { Attributes, AttributeServers } from '@project-chip/matter.js/cluster';
import { createDefaultGroupsClusterServer, createDefaultScenesClusterServer } from '@project-chip/matter.js/cluster';
import { Device, DeviceTypeDefinition } from '@project-chip/matter.js/device';

import { AspectBase, BasicInformationAspect } from '../aspects/index.js';
import { HomeAssistantMatterEntity } from '../models/index.js';

export interface DeviceBaseConfig {
  readonly vendorId: number;
  readonly vendorName: string;
}

export type DeviceConstructor = (entity: HomeAssistantMatterEntity, definition: DeviceTypeDefinition) => Device;

export abstract class DeviceBase implements MatterEndpointDevice {
  public static setDeviceConstructor(ctr: DeviceConstructor): void {
    this.deviceConstructor = ctr;
  }

  private static deviceConstructor: DeviceConstructor;

  public readonly domain: string;
  public readonly entityId: string;
  public readonly friendlyName: string;
  public readonly registered = true;

  public get deviceType(): string {
    return this.endpoint.getDeviceTypes()[0].name;
  }

  public get currentState(): Record<string, object> {
    return Object.fromEntries(
      this.endpoint
        .getAllClusterServers()
        .map((clusterServer) => [clusterServer.name, this.getClusterServerAttributes(clusterServer.attributes)]),
    );
  }

  public readonly endpoint: Device;
  private readonly aspects: AspectBase[] = [];

  protected constructor(entity: HomeAssistantMatterEntity, definition: DeviceTypeDefinition, config: DeviceBaseConfig) {
    this.domain = entity.domain;
    this.entityId = entity.entity_id;
    this.friendlyName = entity.attributes.friendly_name ?? entity.entity_id;

    this.endpoint = DeviceBase.deviceConstructor(entity, definition);

    this.endpoint.addClusterServer(createDefaultGroupsClusterServer());
    this.endpoint.addClusterServer(createDefaultScenesClusterServer());

    this.addAspect(
      new BasicInformationAspect(this.endpoint, entity, {
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
