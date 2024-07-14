import { DeviceTypes } from 'matterbridge';

import { OccupancySensingAspect } from '@/aspects/index.js';

import { BinarySensorDeviceClass } from './binary_sensor-device-class.js';
import { InternalBinarySensorDeviceConfig } from './internal-binary-sensor-device-config.js';

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
