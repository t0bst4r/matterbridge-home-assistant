import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { BridgedDeviceBasicInformationCluster, MatterbridgeDevice } from 'matterbridge';
import crypto from 'crypto';

export class BasicInformationAspect extends MatterAspect<Entity> {
  constructor(
    private readonly device: MatterbridgeDevice,
    entity: Entity,
  ) {
    super(entity.entity_id);

    device.createDefaultBridgedDeviceBasicInformationClusterServer(
      entity.attributes.friendly_name ?? entity.entity_id,
      this.createSerial(entity.entity_id),
      0x0000,
      't0bst4r',
      device.getDeviceTypes().at(0)!.name,
    );
  }

  private get clusterServer() {
    return this.device.getClusterServer(BridgedDeviceBasicInformationCluster)!;
  }

  private createSerial(entityId: string) {
    return crypto.createHash('md5').update(entityId).digest('hex').substring(0, 30);
  }

  async update(state: Entity): Promise<void> {
    const reachable = state.state !== 'unavailable';
    const clusterServer = this.clusterServer;
    if (clusterServer.getReachableAttribute() !== reachable) {
      this.log.debug(`FROM HA: ${this.entityId} changed reachability to ${reachable}`);
      this.clusterServer.setReachableAttribute(reachable);
    }
  }
}
