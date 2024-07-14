import crypto from 'crypto';
import { BridgedDeviceBasicInformationCluster, MatterbridgeDevice } from 'matterbridge';

import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';

export interface BasicInformationAspectConfig {
  readonly vendorId: number;
  readonly vendorName: string;
}

export class BasicInformationAspect extends AspectBase {
  constructor(
    private readonly device: MatterbridgeDevice,
    entity: HomeAssistantMatterEntity,
    config: BasicInformationAspectConfig,
  ) {
    super('BasicInformationAspect', entity);
    device.createDefaultBridgedDeviceBasicInformationClusterServer(
      entity.attributes.friendly_name ?? this.entityId,
      this.createSerial(this.entityId),
      config.vendorId,
      config.vendorName,
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
