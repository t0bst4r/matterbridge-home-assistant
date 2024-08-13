import { DeviceTypes } from '@project-chip/matter.js/device';

import { BinarySensorDeviceClass } from './binary_sensor-device-class.js';
import type { InternalBinarySensorDeviceConfig } from './internal-binary-sensor-device-config.js';

import { BooleanStateAspect } from '../../aspects/index.js';

const invertedContactSensor: InternalBinarySensorDeviceConfig = {
  deviceType: DeviceTypes.CONTACT_SENSOR,
  createAspects: (device, entity) => [
    new BooleanStateAspect(device, entity, {
      invert: true,
    }),
  ],
};
const simpleContactSensor: InternalBinarySensorDeviceConfig = {
  deviceType: DeviceTypes.CONTACT_SENSOR,
  createAspects: (device, entity) => [new BooleanStateAspect(device, entity)],
};

const simpleContactDeviceClasses: BinarySensorDeviceClass[] = [];
const invertedContactDeviceClasses: BinarySensorDeviceClass[] = [
  BinarySensorDeviceClass.Door,
  BinarySensorDeviceClass.Window,
  BinarySensorDeviceClass.GarageDoor,
  BinarySensorDeviceClass.Lock,
];

export const contactDeviceClasses: Partial<Record<BinarySensorDeviceClass, InternalBinarySensorDeviceConfig>> = {
  ...Object.fromEntries(simpleContactDeviceClasses.map((deviceClass) => [deviceClass, simpleContactSensor])),
  ...Object.fromEntries(invertedContactDeviceClasses.map((deviceClass) => [deviceClass, invertedContactSensor])),
};
