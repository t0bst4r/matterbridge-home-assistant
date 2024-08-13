import { Device, DeviceTypeDefinition, DeviceTypes } from '@project-chip/matter.js/device';

import { IdentifyAspect, HumidityMeasurementAspect, TemperatureMeasurementAspect } from '@/aspects/index.js';
import { AspectBase } from '@/aspects/index.js';
import { DeviceBase, DeviceBaseConfig } from '@/devices/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { EntityDomain } from './index.js';
import { UnsupportedDeviceClassError } from './utils/unsupported-device-class-error.js';

// https://www.home-assistant.io/integrations/sensor/
enum SensorDeviceClass {
  Humidity = 'humidity',
  Temperature = 'temperature',
}

interface InternalSensorDeviceConfig {
  deviceType: DeviceTypeDefinition;
  createAspects: (device: Device, entity: HomeAssistantMatterEntity) => AspectBase[];
}

const humiditySensor: InternalSensorDeviceConfig = {
  deviceType: DeviceTypes.HUMIDITY_SENSOR,
  createAspects: (device, entity) => [new HumidityMeasurementAspect(device, entity)],
};

const temperatureSensor: InternalSensorDeviceConfig = {
  deviceType: DeviceTypes.TEMPERATURE_SENSOR,
  createAspects: (device, entity) => [new TemperatureMeasurementAspect(device, entity)],
};

const deviceClassConfigs: Record<SensorDeviceClass, InternalSensorDeviceConfig> = {
  [SensorDeviceClass.Humidity]: humiditySensor,
  [SensorDeviceClass.Temperature]: temperatureSensor,
};

export class SensorDevice extends DeviceBase {
  private static getConfig(entity: HomeAssistantMatterEntity): InternalSensorDeviceConfig {
    if (entity.attributes.device_class) {
      const config = deviceClassConfigs[entity.attributes.device_class as SensorDeviceClass];
      if (config) {
        return config;
      }
    }
    throw new UnsupportedDeviceClassError(EntityDomain.sensor, entity.attributes.device_class ?? '<unknown>');
  }

  constructor(entity: HomeAssistantMatterEntity, config: DeviceBaseConfig) {
    const deviceTypeConfig = SensorDevice.getConfig(entity);
    super(entity, deviceTypeConfig.deviceType, config);
    this.addAspect(new IdentifyAspect(this.matter, entity));
    deviceTypeConfig.createAspects(this.matter, entity).forEach((v) => this.addAspect(v));
  }
}
