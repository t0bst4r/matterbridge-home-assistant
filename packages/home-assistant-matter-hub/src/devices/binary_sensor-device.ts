import { DeviceTypes } from '@project-chip/matter.js/device';

import { BooleanStateAspect, IdentifyAspect } from '@/aspects/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import {
  BinarySensorDeviceClass,
  contactDeviceClasses,
  InternalBinarySensorDeviceConfig,
  occupancyDeviceClasses,
} from './binary_sensor/index.js';
import { DeviceBase, DeviceBaseConfig } from './device-base.js';

// TODO: There is also an on-off-sensor in matter,
//  but OnOff CLIENT cluster seems to be harder to implement than ContactSensor with BooleanState SERVER cluster
const defaultSensor: InternalBinarySensorDeviceConfig = {
  deviceType: DeviceTypes.CONTACT_SENSOR,
  createAspects: (device, entity) => [new BooleanStateAspect(device, entity)],
};

const deviceClassConfigs: Partial<Record<BinarySensorDeviceClass, InternalBinarySensorDeviceConfig>> = {
  ...occupancyDeviceClasses,
  ...contactDeviceClasses,
};

export class BinarySensorDevice extends DeviceBase {
  private static getConfig(entity: HomeAssistantMatterEntity): InternalBinarySensorDeviceConfig {
    let config: InternalBinarySensorDeviceConfig | undefined = undefined;
    if (entity.attributes.device_class) {
      config = deviceClassConfigs[entity.attributes.device_class as BinarySensorDeviceClass];
    }
    return config ?? defaultSensor;
  }

  constructor(entity: HomeAssistantMatterEntity, config: DeviceBaseConfig) {
    const deviceTypeConfig = BinarySensorDevice.getConfig(entity);
    super(entity, deviceTypeConfig.deviceType, config);
    this.addAspect(new IdentifyAspect(this.matter, entity));
    deviceTypeConfig.createAspects(this.matter, entity).forEach(this.addAspect.bind(this));
  }
}
