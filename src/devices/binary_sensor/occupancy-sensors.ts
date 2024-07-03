import { DeviceTypes } from 'matterbridge';
import { OccupancySensingAspect } from '../aspects/occupancy-sensing-aspect.js';
import type { InternalBinarySensorDeviceConfig } from '../binary_sensor-device.js';
import { BinarySensorDeviceClass } from './binary_sensor-device-class.js';

const simpleOccupancySensor: InternalBinarySensorDeviceConfig = {
  deviceType: DeviceTypes.OCCUPANCY_SENSOR,
  createAspects: (device, entity) => [new OccupancySensingAspect(device, entity)],
};
const simpleOccupancyDeviceClasses: BinarySensorDeviceClass[] = [
  BinarySensorDeviceClass.Occupancy,
  BinarySensorDeviceClass.Motion,
  BinarySensorDeviceClass.Moving,
  BinarySensorDeviceClass.Presence,
];

export const occupancyDeviceClasses: Partial<Record<BinarySensorDeviceClass, InternalBinarySensorDeviceConfig>> = {
  ...Object.fromEntries(simpleOccupancyDeviceClasses.map((deviceClass) => [deviceClass, simpleOccupancySensor])),
};
