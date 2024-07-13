import { DeviceTypeDefinition, MatterbridgeDevice } from 'matterbridge';
import { MatterAspect } from './aspects/matter-aspect.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { BasicInformationAspect } from './aspects/basic-information-aspect.js';

export abstract class HomeAssistantDevice {
  public readonly entityId: string;
  public readonly matter: MatterbridgeDevice;
  private readonly aspects: MatterAspect<Entity>[] = [];

  protected constructor(entity: Entity, definition: DeviceTypeDefinition) {
    this.entityId = entity.entity_id;
    this.matter = new MatterbridgeDevice(definition);
    this.matter.log.setLogDebug(process.env.LOG_DEBUG === 'true');
    this.matter.log.setLogName(this.entityId);

    this.matter.createDefaultGroupsClusterServer();
    this.matter.createDefaultScenesClusterServer();
    this.addAspect(new BasicInformationAspect(this.matter, entity));
  }

  public addAspect(aspect: MatterAspect<Entity>): void {
    this.aspects.push(aspect);
  }

  public async updateState(state: Entity): Promise<void> {
    for (const aspect of this.aspects) {
      await aspect.update(state);
    }
  }
}
