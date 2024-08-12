export * from './device-base.js';
export * from './binary_sensor-device.js';
export * from './climate-device.js';
export * from './light-device.js';
export * from './lock-device.js';
export * from './switch-device.js';
export * from './cover-device.js';
export * from './fan-device.js';
export * from './sensor-device.js';
export * from './utils/unsupported-device-class-error.js';

export enum EntityDomain {
  automation = 'automation',
  binary_sensor = 'binary_sensor',
  cover = 'cover',
  input_boolean = 'input_boolean',
  light = 'light',
  lock = 'lock',
  media_player = 'media_player',
  scene = 'scene',
  script = 'script',
  switch = 'switch',
  fan = 'fan',
  sensor = 'sensor',
}
