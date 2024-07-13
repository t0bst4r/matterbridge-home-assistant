import { DeviceTypeDefinition, DeviceTypes, MatterbridgeDevice } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { IdentifyAspect } from './aspects/identify-aspect.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { BooleanStateAspect } from './aspects/boolean-state-aspect.js';
import { MatterAspect } from './aspects/matter-aspect.js';
import { BinarySensorDeviceClass } from './binary_sensor/binary_sensor-device-class.js';
import { occupancyDeviceClasses } from './binary_sensor/occupancy-sensors.js';
import { contactDeviceClasses } from './binary_sensor/contact-sensors.js';

export interface InternalBinarySensorDeviceConfig {
  deviceType: DeviceTypeDefinition;
  createAspects: (device: MatterbridgeDevice, entity: Entity) => MatterAspect<Entity>[];
}

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

export class BinarySensorDevice extends HomeAssistantDevice {
  private static getConfig(entity: Entity): InternalBinarySensorDeviceConfig {
    let config: InternalBinarySensorDeviceConfig | undefined = undefined;
    if (entity.attributes.device_class) {
      config = deviceClassConfigs[entity.attributes.device_class as BinarySensorDeviceClass];
    }
    return config ?? defaultSensor;
  }

  constructor(entity: Entity) {
    const config = BinarySensorDevice.getConfig(entity);
    super(entity, config.deviceType);
    this.addAspect(new IdentifyAspect(this.matter, entity));
    config.createAspects(this.matter, entity).forEach(this.addAspect.bind(this));
  }
}
