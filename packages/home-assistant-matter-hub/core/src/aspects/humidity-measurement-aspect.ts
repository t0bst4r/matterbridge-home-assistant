import { ClusterServer, RelativeHumidityMeasurementCluster } from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';

export class HumidityMeasurementAspect extends AspectBase {
  constructor(
    private readonly device: Device,
    entity: HomeAssistantMatterEntity,
  ) {
    super('HumidityMeasurementAspect', entity);

    device.addClusterServer(
      ClusterServer(
        RelativeHumidityMeasurementCluster,
        {
          minMeasuredValue: null,
          maxMeasuredValue: null,
          measuredValue: this.getMeasuredValue(entity.state),
        },
        {},
      ),
    );
  }

  async update(entity: HomeAssistantMatterEntity): Promise<void> {
    const cluster = this.device.getClusterServer(RelativeHumidityMeasurementCluster)!;
    const value = this.getMeasuredValue(entity.state);
    if (value != null && cluster.getMeasuredValueAttribute() !== value) {
      this.log.debug('FROM HA: %s changed measured value to %s', this.entityId, value);
      cluster.setMeasuredValueAttribute(value);
    }
  }

  getMeasuredValue(state: string) {
    if (state != null && !isNaN(+state)) {
      return +state * 100;
    }
    return null;
  }
}
