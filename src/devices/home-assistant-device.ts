import * as crypto from 'crypto';
import { HassEntity } from 'home-assistant-js-websocket';
import { MatterbridgeDevice } from 'matterbridge';
import { MatterAspect } from './aspects/matter-aspect.js';
import { Entity } from '../home-assistant/entity/entity.js';

export abstract class HomeAssistantDevice {
  public readonly entityId: string;
  private readonly aspects: MatterAspect<Entity>[] = [];

  protected constructor(
    entity: HassEntity,
    public readonly matter: MatterbridgeDevice,
  ) {
    this.entityId = entity.entity_id;

    matter.createDefaultGroupsClusterServer();
    matter.createDefaultScenesClusterServer();
    matter.createDefaultBridgedDeviceBasicInformationClusterServer(
      entity.attributes.friendly_name ?? entity.entity_id,
      this.createSerial(entity.entity_id),
      0x0000,
      't0bst4r',
      matter.getDeviceTypes().at(0)!.name,
    );
  }

  public addAspect(aspect: MatterAspect<Entity>): void {
    this.aspects.push(aspect);
  }

  public async updateState(state: HassEntity): Promise<void> {
    for (const aspect of this.aspects) {
      await aspect.update(state);
    }
  }

  private createSerial(entityId: string) {
    return crypto.createHash('md5').update(entityId).digest('hex').substring(0, 30);
  }
}
