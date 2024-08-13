import { ClusterServer, OccupancySensing, OccupancySensingCluster } from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { AspectBase } from './aspect-base.js';

import { HomeAssistantMatterEntity } from '../models/index.js';

export class OccupancySensingAspect extends AspectBase {
  constructor(
    private readonly device: Device,
    entity: HomeAssistantMatterEntity,
  ) {
    super('OccupancySensingAspect', entity);
    device.addClusterServer(
      ClusterServer(
        OccupancySensingCluster,
        {
          occupancy: { occupied: this.isOccupied(entity) },
          occupancySensorType: OccupancySensing.OccupancySensorType.PhysicalContact,
          occupancySensorTypeBitmap: { pir: false, physicalContact: true, ultrasonic: false },
        },
        {},
      ),
    );
  }

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const occupancySensingClusterSever = this.device.getClusterServer(OccupancySensingCluster)!;
    const isOccupied = this.isOccupied(state);
    if (occupancySensingClusterSever.getOccupancyAttribute().occupied !== isOccupied) {
      this.log.debug('FROM HA: %s changed occupancy state to %s', state.entity_id, state.state);
      occupancySensingClusterSever.setOccupancyAttribute({ occupied: isOccupied });
    }
  }

  private isOccupied(entity: HomeAssistantMatterEntity): boolean {
    return entity.state !== 'off';
  }
}
