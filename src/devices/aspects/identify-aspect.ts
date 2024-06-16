import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { MatterbridgeDevice } from 'matterbridge';

export class IdentifyAspect extends MatterAspect<Entity> {
  constructor(device: MatterbridgeDevice, entity: Entity) {
    super(entity.entity_id);
    this.log.setLogName('IdentifyAspect');
    device.createDefaultIdentifyClusterServer();
    device.addCommandHandler('identify', this.onIdentify.bind(this));
  }

  private onIdentify() {
    this.log.debug(`Identify called for ${this.entityId}`);
  }

  async update(): Promise<void> {}
}
