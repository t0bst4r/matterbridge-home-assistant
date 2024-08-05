import { DeviceBase } from '@/devices/index.js';

export interface MatterRegistry {
  register(device: DeviceBase): Promise<void>;
  unregister(device: DeviceBase): Promise<void>;
}
