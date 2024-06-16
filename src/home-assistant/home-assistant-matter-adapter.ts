import { EntityConsumer } from './entity/entity-manager.js';
import { Entity } from './entity/entity.js';
import { HassEntity } from 'home-assistant-js-websocket';
import { HomeAssistantDevice } from '../devices/home-assistant-device.js';
import { LightDevice } from '../devices/light-device.js';
import { SwitchDevice } from '../devices/switch-device.js';
import { HomeAssistantClient } from './home-assistant-client.js';
import { AnsiLogger } from 'node-ansi-logger/dist';
import { MatterbridgeDynamicPlatform } from 'matterbridge';

export class HomeAssistantMatterAdapter implements EntityConsumer {
  private readonly unsupportedEntities = new Set<string>();
  private readonly devices = new Map<string, HomeAssistantDevice>();

  private readonly deviceFactories: Record<string, (entity: HassEntity) => HomeAssistantDevice> = {
    light: (entity) => new LightDevice(this.client, entity),
    switch: (entity) => new SwitchDevice(this.client, entity),
    media_player: (entity) => new SwitchDevice(this.client, entity),
    scene: (entity) => new SwitchDevice(this.client, entity),
    script: (entity) => new SwitchDevice(this.client, entity),
    automation: (entity) => new SwitchDevice(this.client, entity),
  };

  constructor(
    private readonly log: AnsiLogger,
    private readonly client: HomeAssistantClient,
    private readonly platform: MatterbridgeDynamicPlatform,
  ) {}

  async onCreate(entity: Entity) {
    if (entity.hidden) {
      this.log.debug(`Entity '${entity.entity_id}' is hidden`);
      return;
    }

    const domain = entity.entity_id.split('.')[0];
    if (!this.deviceFactories[domain]) {
      this.unsupportedEntities.add(entity.entity_id);
      this.log.debug(`Entity '${entity.entity_id}' is not supported`);
      return;
    }

    const device = this.deviceFactories[domain](entity);
    try {
      this.devices.set(entity.entity_id, device);
      await this.platform.registerDevice(device.matter);
    } catch (e: unknown) {
      this.log.warn(`Failed to register device: ${entity.entity_id}`);
      this.log.error((e as object).toString());
      this.unsupportedEntities.add(entity.entity_id);
    }
    await device.updateState(entity);
  }

  async onUpdate(entity: Entity) {
    if (this.unsupportedEntities.has(entity.entity_id)) {
      return;
    }
    const device = this.devices.get(entity.entity_id);
    if (device && !entity.hidden) {
      await device.updateState(entity);
    } else if (device && entity.hidden) {
      this.log.debug(`Entity '${entity.entity_id}' exists, but should be hidden`);
      await this.onDelete(entity.entity_id);
    } else if (!device && !entity.hidden) {
      this.log.debug(`Entity '${entity.entity_id}' does not exist, but is not hidden`);
      await this.onCreate(entity);
    }
  }

  async onDelete(entityId: string) {
    const device = this.devices.get(entityId);
    if (device) {
      await this.platform.unregisterDevice(device.matter);
      this.devices.delete(entityId);
    }
  }
}
