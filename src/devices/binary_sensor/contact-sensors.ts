import { DeviceTypes } from 'matterbridge';
import type { InternalBinarySensorDeviceConfig } from '../binary_sensor-device.js';
import { BinarySensorDeviceClass } from './binary_sensor-device-class.js';
import { BooleanStateAspect } from '../aspects/boolean-state-aspect.js';

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
