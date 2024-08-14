import { ClusterServer, TemperatureMeasurementCluster } from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';

export class TemperatureMeasurementAspect extends AspectBase {
  private unitOfMeasurement: string | undefined;

  constructor(
    private readonly device: Device,
    entity: HomeAssistantMatterEntity,
  ) {
    super('TemperatureMeasurementAspect', entity);
    this.unitOfMeasurement = entity.attributes.unit_of_measurement;
    device.addClusterServer(
      ClusterServer(
        TemperatureMeasurementCluster,
        {
          minMeasuredValue: null,
          maxMeasuredValue: null,
          measuredValue: this.getTemperatureInCelsius(entity),
        },
        {},
      ),
    );
  }

  async update(entity: HomeAssistantMatterEntity): Promise<void> {
    const cluster = this.device.getClusterServer(TemperatureMeasurementCluster)!;
    const value = this.getTemperatureInCelsius(entity);
    if (value != null && cluster.getMeasuredValueAttribute() !== value) {
      this.log.debug('FROM HA: %s changed measured value to %s', this.entityId, value);
      cluster.setMeasuredValueAttribute(value);
    }
  }

  getTemperatureInCelsius(entity: HomeAssistantMatterEntity): number | null {
    if (entity.state == null || isNaN(+entity.state)) {
      return null;
    }

    const temperature = +entity.state * 100;
    switch (this.unitOfMeasurement) {
      case '°C':
        return temperature;
      case '°F':
        return ((temperature - 32) * 5) / 9;
      case 'K':
        return temperature - 273.15;
      default:
        this.log.warn('Unsupported unit of measurement for temperature: %s', this.unitOfMeasurement);
        return null;
    }
  }
}
