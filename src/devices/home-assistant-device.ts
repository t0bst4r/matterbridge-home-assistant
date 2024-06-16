import * as crypto from 'crypto';
import { HassEntity } from 'home-assistant-js-websocket';
import { MatterbridgeDevice, DeviceTypeDefinition } from 'matterbridge';
import { MatterAspect } from './aspects/matter-aspect.js';
import { Entity } from '../home-assistant/entity/entity.js';

export abstract class HomeAssistantDevice {
  public readonly entityId: string;
  public readonly matter: MatterbridgeDevice;
  private readonly aspects: MatterAspect<Entity>[] = [];

  protected constructor(entity: HassEntity, definition: DeviceTypeDefinition) {
    this.entityId = entity.entity_id;
    this.matter = new MatterbridgeDevice(definition);
    this.matter.log.setLogDebug(process.env.LOG_DEBUG === 'true');
    this.matter.log.setLogName(this.entityId);

    this.matter.createDefaultGroupsClusterServer();
    this.matter.createDefaultScenesClusterServer();
    this.matter.createDefaultBridgedDeviceBasicInformationClusterServer(
      entity.attributes.friendly_name ?? entity.entity_id,
      this.createSerial(entity.entity_id),
      0x0000,
      't0bst4r',
      this.matter.getDeviceTypes().at(0)!.name,
    );
  }

  public addAspect(aspect: MatterAspect<Entity>): void {
    this.aspects.push(aspect);
  }

  public async updateState(state: Entity): Promise<void> {
    for (const aspect of this.aspects) {
      await aspect.update(state);
    }
  }

  private createSerial(entityId: string) {
    return crypto.createHash('md5').update(entityId).digest('hex').substring(0, 30);
  }
}
