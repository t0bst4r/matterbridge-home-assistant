import { BridgedDeviceBasicInformationCluster, ClusterServer } from '@project-chip/matter.js/cluster';
import { VendorId } from '@project-chip/matter.js/datatype';
import { Device } from '@project-chip/matter.js/device';

import { AspectBase } from './aspect-base.js';

import { HomeAssistantMatterEntity } from '../models/index.js';

export interface BasicInformationAspectConfig {
  readonly vendorId: number;
  readonly vendorName: string;
}

export class BasicInformationAspect extends AspectBase {
  constructor(
    private readonly device: Device,
    entity: HomeAssistantMatterEntity,
    config: BasicInformationAspectConfig,
  ) {
    super('BasicInformationAspect', entity);
    const productName = device.getDeviceTypes().at(0)!.name;

    device.addClusterServer(
      ClusterServer(
        BridgedDeviceBasicInformationCluster,
        {
          vendorId: VendorId(config.vendorId),
          vendorName: config.vendorName.slice(0, 32),
          productName: productName.slice(0, 32),
          productLabel: entity.matter.deviceName.slice(0, 64),
          nodeLabel: entity.matter.deviceName.slice(0, 32),
          serialNumber: entity.matter.serialNumber,
          uniqueId: entity.matter.uniqueId,
          softwareVersion: 1,
          softwareVersionString: '1.0.0',
          hardwareVersion: 1,
          hardwareVersionString: '1.0.0',
          reachable: this.isReachable(entity),
        },
        {},
        {
          startUp: true,
          shutDown: true,
          leave: true,
          reachableChanged: true,
        },
      ),
    );
  }

  private get clusterServer() {
    return this.device.getClusterServer(BridgedDeviceBasicInformationCluster)!;
  }

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const reachable = this.isReachable(state);
    const clusterServer = this.clusterServer;
    if (clusterServer.getReachableAttribute() !== reachable) {
      this.log.debug('FROM HA: %s changed reachability to %s', this.entityId, reachable);
      this.clusterServer.setReachableAttribute(reachable);
    }
  }

  private isReachable(state: HomeAssistantMatterEntity): boolean {
    return state.state !== 'unavailable';
  }
}
