import { MatterbridgeDevice, OccupancySensingCluster } from 'matterbridge';

import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';

export class OccupancySensingAspect extends AspectBase {
  private readonly log = this.baseLogger.child({ aspect: 'OccupancySensingAspect' });

  constructor(
    private readonly device: MatterbridgeDevice,
    entity: HomeAssistantMatterEntity,
  ) {
    super(entity);
    device.createDefaultOccupancySensingClusterServer(this.isOccupied(entity));
  }

  private get occupancySensingCluster() {
    return this.device.getClusterServer(OccupancySensingCluster);
  }

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const occupancySensingClusterSever = this.occupancySensingCluster!;
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
