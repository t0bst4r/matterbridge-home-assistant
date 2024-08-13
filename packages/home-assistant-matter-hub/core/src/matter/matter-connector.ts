import debounce from 'debounce-promise';
import _ from 'lodash';

import { MatterRegistry } from './matter-registry.js';

import * as devices from '../devices/index.js';
import { DeviceBaseConfig, EntityDomain } from '../devices/index.js';
import { HomeAssistantClient, HomeAssistantClientConfig, UnsubscribeFn } from '../home-assistant-client/index.js';
import { logger } from '../logging/index.js';
import { HomeAssistantMatterEntities, HomeAssistantMatterEntity } from '../models/index.js';

export { HomeAssistantClientConfig, PatternMatcherConfig } from '../home-assistant-client/index.js';
export { DeviceBaseConfig } from '../devices/index.js';

export interface DeviceOverrides {
  domains?: Partial<Record<EntityDomain, unknown>>;
  entities?: Partial<Record<string, unknown>>;
}

export interface MatterConnectorConfig {
  readonly homeAssistant: HomeAssistantClientConfig;
  readonly registry: MatterRegistry;
  readonly devices: DeviceBaseConfig;
  readonly overrides?: DeviceOverrides;
}

export class MatterConnector {
  public static async create(config: MatterConnectorConfig): Promise<MatterConnector> {
    const client = await HomeAssistantClient.create(config.homeAssistant);
    const connector = new MatterConnector(client, config.registry, config.devices, config.overrides ?? {});
    await connector.init();
    return connector;
  }

  private readonly log = logger.child({ service: 'MatterConnector' });

  private readonly deviceFactories: Record<
    EntityDomain,
    (entity: HomeAssistantMatterEntity, config: DeviceBaseConfig & unknown) => devices.DeviceBase
  > = {
    [EntityDomain.light]: (entity, config) => new devices.LightDevice(this.client, entity, config),
    [EntityDomain.switch]: (entity, config) => new devices.SwitchDevice(this.client, entity, config),
    [EntityDomain.input_boolean]: (entity, config) => new devices.SwitchDevice(this.client, entity, config),
    [EntityDomain.media_player]: (entity, config) => new devices.SwitchDevice(this.client, entity, config),
    [EntityDomain.lock]: (entity, config) => new devices.LockDevice(this.client, entity, config),
    [EntityDomain.scene]: (entity, config) => new devices.SwitchDevice(this.client, entity, config),
    [EntityDomain.script]: (entity, config) => new devices.SwitchDevice(this.client, entity, config),
    [EntityDomain.automation]: (entity, config) => new devices.SwitchDevice(this.client, entity, config),
    [EntityDomain.binary_sensor]: (entity, config) => new devices.BinarySensorDevice(entity, config),
    [EntityDomain.cover]: (entity, config) => new devices.CoverDevice(this.client, entity, config),
    [EntityDomain.fan]: (entity) => new devices.FanDevice(this.client, entity, this.defaultDeviceConfig),
    [EntityDomain.sensor]: (entity, config) => new devices.SensorDevice(entity, config),
    // climate: (entity) => new ClimateDevice(this.client, entity),
  };

  private readonly ignoreEntities = new Set<string>();
  private readonly hiddenEntities = new Set<string>();
  private readonly devices = new Map<string, devices.DeviceBase>();
  private unsubscribeEntities!: UnsubscribeFn;

  private constructor(
    private readonly client: HomeAssistantClient,
    private readonly registry: MatterRegistry,
    private readonly defaultDeviceConfig: DeviceBaseConfig,
    private readonly deviceOverrides: DeviceOverrides,
  ) {}

  private async init(): Promise<void> {
    this.unsubscribeEntities = await this.client.subscribeEntities(debounce(this.expensiveUpdate.bind(this)));
  }

  public close(): void {
    this.unsubscribeEntities();
    this.client.close?.();
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
  }

  private async create(entity: HomeAssistantMatterEntity) {
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

    const domain = entity.entity_id.split('.')[0] as EntityDomain;
    if (!this.deviceFactories[domain]) {
      this.ignoreEntities.add(entity.entity_id);
      this.log.debug('Entity %s is not supported', entity.entity_id);
      return;
    }

    const deviceConfig = _.merge(
      {},
      this.defaultDeviceConfig,
      this.deviceOverrides.domains?.[domain] ?? {},
      this.deviceOverrides.entities?.[entity.entity_id] ?? {},
    );

    try {
      const device = this.deviceFactories[domain](entity, deviceConfig);
      await this.registry.register(device);
      this.devices.set(entity.entity_id, device);
      await device.updateState(entity);
    } catch (e: unknown) {
      this.log.warn('Failed to register device for %s', entity.entity_id);
      this.log.error((e as object).toString());
      this.ignoreEntities.add(entity.entity_id);
      this.devices.delete(entity.entity_id);
    }
  }

  private async update(entity: HomeAssistantMatterEntity) {
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

  private async remove(entityId: string) {
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
