import debounce from 'debounce-promise';

import * as devices from '@/devices/index.js';
import { HomeAssistantClient, HomeAssistantClientConfig, UnsubscribeFn } from '@/home-assistant-client/index.js';
import { logger } from '@/logging/index.js';
import { MatterRegistry } from '@/matter/matter-registry.js';
import { HomeAssistantMatterEntities, HomeAssistantMatterEntity } from '@/models/index.js';

export interface MatterConnectorConfig {
  homeAssistant: HomeAssistantClientConfig;
  registry: MatterRegistry;
}

export { HomeAssistantClientConfig, PatternMatcherConfig } from '@/home-assistant-client/index.js';

export class MatterConnector {
  public static async create(config: MatterConnectorConfig): Promise<MatterConnector> {
    const client = await HomeAssistantClient.create(config.homeAssistant);
    return new MatterConnector(client, config.registry);
  }

  private readonly log = logger.child({ service: 'MatterConnector' });

  private readonly deviceFactories: Record<string, (entity: HomeAssistantMatterEntity) => devices.DeviceBase> = {
    light: (entity) => new devices.LightDevice(this.client, entity),
    switch: (entity) => new devices.SwitchDevice(this.client, entity),
    input_boolean: (entity) => new devices.SwitchDevice(this.client, entity),
    media_player: (entity) => new devices.SwitchDevice(this.client, entity),
    lock: (entity) => new devices.LockDevice(this.client, entity),
    scene: (entity) => new devices.SwitchDevice(this.client, entity),
    script: (entity) => new devices.SwitchDevice(this.client, entity),
    automation: (entity) => new devices.SwitchDevice(this.client, entity),
    binary_sensor: (entity) => new devices.BinarySensorDevice(entity),
    // climate: (entity) => new ClimateDevice(this.client, entity),
  };

  private readonly ignoreEntities = new Set<string>();
  private readonly hiddenEntities = new Set<string>();
  private readonly devices = new Map<string, devices.DeviceBase>();
  private _isInitialized: boolean = false;
  public readonly close: UnsubscribeFn;

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  private constructor(
    private readonly client: HomeAssistantClient,
    private readonly registry: MatterRegistry,
  ) {
    const update = debounce(this.expensiveUpdate.bind(this));
    this.close = this.client.subscribeEntities(update);
  }

  private async expensiveUpdate(entities: HomeAssistantMatterEntities) {
    const entityIds = Object.keys(entities);
    const created = entityIds.filter((it) => !this.devices.has(it));
    const updated = entityIds.filter((it) => this.devices.has(it));
    const removed = Array.from(this.devices.keys()).filter((it) => !entityIds.includes(it));
    for (const createdEntity of created) {
      await this.create(entities[createdEntity]);
    }
    for (const updatedEntity of updated) {
      await this.update(entities[updatedEntity]);
    }
    for (const removedEntity of removed) {
      await this.remove(removedEntity);
    }
    this._isInitialized = true;
  }

  async create(entity: HomeAssistantMatterEntity) {
    if (this.ignoreEntities.has(entity.entity_id)) {
      return;
    }
    if (entity.hidden) {
      if (!this.hiddenEntities.has(entity.entity_id)) {
        this.hiddenEntities.add(entity.entity_id);
        this.log.debug('Entity %s is hidden', entity.entity_id);
      }
      return;
    }

    if (this.hiddenEntities.has(entity.entity_id)) {
      this.hiddenEntities.delete(entity.entity_id);
      this.log.debug('Entity %s was hidden, but is not anymore', entity.entity_id);
    }

    const domain = entity.entity_id.split('.')[0];
    if (!this.deviceFactories[domain]) {
      this.ignoreEntities.add(entity.entity_id);
      this.log.debug('Entity %s is not supported', entity.entity_id);
      return;
    }

    const device = this.deviceFactories[domain](entity);
    try {
      await this.registry.register(device);
      this.devices.set(entity.entity_id, device);
    } catch (e: unknown) {
      this.log.warn('Failed to register device for %s', entity.entity_id);
      this.log.error((e as object).toString());
      this.ignoreEntities.add(entity.entity_id);
      this.devices.delete(entity.entity_id);
    }
    await device.updateState(entity);
  }

  async update(entity: HomeAssistantMatterEntity) {
    if (this.ignoreEntities.has(entity.entity_id)) {
      return;
    }
    const device = this.devices.get(entity.entity_id);
    if (device && !entity.hidden) {
      await device.updateState(entity);
    } else if (device && entity.hidden) {
      this.log.debug('Entity %s exists, but should be hidden', entity.entity_id);
      await this.remove(entity.entity_id);
    } else if (!device && !entity.hidden) {
      this.log.debug('Entity %s does not exist, but is not hidden', entity.entity_id);
      await this.create(entity);
    }
  }

  async remove(entityId: string) {
    if (this.devices.has(entityId)) {
      try {
        await this.registry.unregister(this.devices.get(entityId)!);
        this.log.debug('Deleted device %s', entityId);
        this.devices.delete(entityId);
      } catch (e: unknown) {
        this.log.warn('Failed to unregister device for %s', entityId);
        this.log.error((e as object).toString());
        this.ignoreEntities.add(entityId);
        this.devices.delete(entityId);
      }
    }
  }
}
