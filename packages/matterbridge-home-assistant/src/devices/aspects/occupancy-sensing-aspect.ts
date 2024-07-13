import { MatterbridgeDevice, OccupancySensingCluster } from 'matterbridge';
import { Entity } from '../../home-assistant/entity/entity.js';
import { MatterAspect } from './matter-aspect.js';

export class OccupancySensingAspect extends MatterAspect<Entity> {
  constructor(
    private readonly device: MatterbridgeDevice,
    entity: Entity,
  ) {
    super(entity.entity_id);
    this.log.setLogName('OccupancySensingAspect');
    device.createDefaultOccupancySensingClusterServer(this.isOccupied(entity));
  }

  private get occupancySensingCluster() {
    return this.device.getClusterServer(OccupancySensingCluster);
  }

  async update(state: Entity): Promise<void> {
    const occupancySensingClusterSever = this.occupancySensingCluster!;
    const isOccupied = this.isOccupied(state);
    if (occupancySensingClusterSever.getOccupancyAttribute().occupied !== isOccupied) {
      this.log.debug(`FROM HA: ${state.entity_id} changed occupancy state to ${state.state}`);
      occupancySensingClusterSever.setOccupancyAttribute({ occupied: isOccupied });
    }
  }

  private isOccupied(entity: Entity): boolean {
    return entity.state !== 'off';
  }
}
