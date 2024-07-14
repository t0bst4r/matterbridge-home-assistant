import crypto from 'crypto';
import { BridgedDeviceBasicInformationCluster, MatterbridgeDevice } from 'matterbridge';

import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';

export class BasicInformationAspect extends AspectBase {
  private readonly log = this.baseLogger.child({ aspect: 'BasicInformationAspect' });

  constructor(
    private readonly device: MatterbridgeDevice,
    entity: HomeAssistantMatterEntity,
  ) {
    super(entity);
    device.createDefaultBridgedDeviceBasicInformationClusterServer(
      entity.attributes.friendly_name ?? this.entityId,
      this.createSerial(this.entityId),
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

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const reachable = state.state !== 'unavailable';
    const clusterServer = this.clusterServer;
    if (clusterServer.getReachableAttribute() !== reachable) {
      this.log.debug('FROM HA: %s changed reachability to %s', this.entityId, reachable);
      this.clusterServer.setReachableAttribute(reachable);
    }
  }
}
