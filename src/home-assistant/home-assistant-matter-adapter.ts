import { Entity } from './entity/entity.js';
import { HomeAssistantDevice } from '../devices/home-assistant-device.js';
import { LightDevice } from '../devices/light-device.js';
import { SwitchDevice } from '../devices/switch-device.js';
import { HomeAssistantClient, UnsubscribeFn } from './home-assistant-client.js';
import { AnsiLogger, TimestampFormat } from 'node-ansi-logger';
import { MatterbridgeDynamicPlatform } from 'matterbridge';
import { PatternMatcher } from '../util/pattern-matcher.js';
import debounce from 'debounce-promise';

export class HomeAssistantMatterAdapter {
  private readonly log: AnsiLogger = new AnsiLogger({
    logName: 'HomeAssistantMatterAdapter',
    logTimestampFormat: TimestampFormat.TIME_MILLIS,
    logDebug: process.env.LOG_DEBUG === 'true',
  });

  private readonly deviceFactories: Record<string, (entity: Entity) => HomeAssistantDevice> = {
    light: (entity) => new LightDevice(this.client, entity),
    switch: (entity) => new SwitchDevice(this.client, entity),
    media_player: (entity) => new SwitchDevice(this.client, entity),
    scene: (entity) => new SwitchDevice(this.client, entity),
    script: (entity) => new SwitchDevice(this.client, entity),
    automation: (entity) => new SwitchDevice(this.client, entity),
  };

  private readonly ignoreEntities = new Set<string>();
  private readonly hiddenEntities = new Set<string>();
  private readonly devices = new Map<string, HomeAssistantDevice>();
  public readonly close: UnsubscribeFn;

  constructor(
    private readonly client: HomeAssistantClient,
    private readonly platform: MatterbridgeDynamicPlatform,
    private readonly patternMatcher: PatternMatcher,
  ) {
    const update = debounce(this.expensiveUpdate.bind(this));
    this.close = this.client.subscribe(update);
  }

  private async expensiveUpdate(entities: Record<string, Entity>) {
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

  async create(entity: Entity) {
    if (this.ignoreEntities.has(entity.entity_id)) {
      return;
    }
    if (entity.hidden) {
      if (!this.hiddenEntities.has(entity.entity_id)) {
        this.hiddenEntities.add(entity.entity_id);
        this.log.debug(`Entity '${entity.entity_id}' is hidden`);
      }
      return;
    }

    if (this.hiddenEntities.has(entity.entity_id)) {
      this.hiddenEntities.delete(entity.entity_id);
      this.log.debug(`Entity '${entity.entity_id}' was hidden, but is not anymore`);
    }

    if (!this.patternMatcher.isIncluded(entity.entity_id)) {
      this.ignoreEntities.add(entity.entity_id);
      this.log.debug(`Entity '${entity.entity_id}' is not included, but excluded by patterns`);
      return;
    }

    const domain = entity.entity_id.split('.')[0];
    if (!this.deviceFactories[domain]) {
      this.ignoreEntities.add(entity.entity_id);
      this.log.debug(`Entity '${entity.entity_id}' is not supported`);
      return;
    }

    const device = this.deviceFactories[domain](entity);
    try {
      await this.platform.registerDevice(device.matter);
      this.devices.set(entity.entity_id, device);
    } catch (e: unknown) {
      this.log.warn(`Failed to register device for ${entity.entity_id}`);
      this.log.error((e as object).toString());
      this.ignoreEntities.add(entity.entity_id);
      this.devices.delete(entity.entity_id);
    }
    await device.updateState(entity);
  }

  async update(entity: Entity) {
    if (this.ignoreEntities.has(entity.entity_id)) {
      return;
    }
    const device = this.devices.get(entity.entity_id);
    if (device && !entity.hidden) {
      await device.updateState(entity);
    } else if (device && entity.hidden) {
      this.log.debug(`Entity '${entity.entity_id}' exists, but should be hidden`);
      await this.remove(entity.entity_id);
    } else if (!device && !entity.hidden) {
      this.log.debug(`Entity '${entity.entity_id}' does not exist, but is not hidden`);
      await this.create(entity);
    }
  }

  async remove(entityId: string) {
    if (this.devices.has(entityId)) {
      try {
        await this.platform.unregisterDevice(this.devices.get(entityId)!.matter);
        this.log.debug(`Deleted device ${entityId}`);
        this.devices.delete(entityId);
      } catch (e: unknown) {
        this.log.warn(`Failed to unregister device for ${entityId}`);
        this.log.error((e as object).toString());
        this.ignoreEntities.add(entityId);
        this.devices.delete(entityId);
      }
    }
  }
}
