import { DeviceTypeDefinition, DeviceTypes } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { IdentifyAspect } from './aspects/identify-aspect.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { BooleanStateAspect } from './aspects/boolean-state-aspect.js';
import { OccupancySensingAspect } from './aspects/occupancy-sensing-aspect.js';
import { OnOffAspect } from './aspects/on-off-aspect.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';

// https://www.home-assistant.io/integrations/binary_sensor/
const SENSOR_TYPES: Record<string, DeviceTypeDefinition> = {
  default: DeviceTypes.ON_OFF_SENSOR,
  door: DeviceTypes.CONTACT_SENSOR,
  garage_door: DeviceTypes.CONTACT_SENSOR,
  window: DeviceTypes.CONTACT_SENSOR,
  opening: DeviceTypes.CONTACT_SENSOR,
  occupancy: DeviceTypes.OCCUPANCY_SENSOR,
  motion: DeviceTypes.OCCUPANCY_SENSOR,
};

const deviceClassToDeviceTypeDefinition = (deviceClass: string | undefined): DeviceTypeDefinition => {
  return SENSOR_TYPES[deviceClass ?? 'default'] ?? SENSOR_TYPES['default'];
};

export class BinarySensorDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: Entity) {
    console.log(entity);
    const deviceType = deviceClassToDeviceTypeDefinition(entity.attributes.device_class);
    super(entity, deviceType);
    this.addAspect(new IdentifyAspect(this.matter, entity));
    if (deviceType === DeviceTypes.CONTACT_SENSOR) {
      this.addAspect(new BooleanStateAspect(this.matter, entity));
    } else if (deviceType === DeviceTypes.OCCUPANCY_SENSOR) {
      this.addAspect(new OccupancySensingAspect(this.matter, entity));
    } else {
      this.addAspect(new OnOffAspect(homeAssistantClient, this.matter, entity));
    }
  }
}
