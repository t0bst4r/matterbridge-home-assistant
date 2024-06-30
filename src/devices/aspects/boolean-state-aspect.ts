import { MatterbridgeDevice, BooleanStateCluster } from 'matterbridge';
import { Entity } from '../../home-assistant/entity/entity.js';
import { MatterAspect } from './matter-aspect.js';

export class BooleanStateAspect extends MatterAspect<Entity> {
  constructor(
    private readonly device: MatterbridgeDevice,
    entity: Entity,
  ) {
    super(entity.entity_id);
    this.log.setLogName('BooleanStateAspect');

    device.createDefaultBooleanStateClusterServer(entity.state !== 'off');
  }

  private get booleanStateCluster() {
    return this.device.getClusterServer(BooleanStateCluster);
  }

  async update(state: Entity): Promise<void> {
    const booleanStateClusterServer = this.booleanStateCluster!;
    const isOnFn = (entity: Entity) => entity.state !== 'off';
    const isOn = isOnFn(state);
    if (booleanStateClusterServer.getStateValueAttribute() !== isOn) {
      this.log.debug(`FROM HA: ${state.entity_id} changed boolean state to ${state.state}`);
      booleanStateClusterServer.setStateValueAttribute(isOn);
    }
  }
}
