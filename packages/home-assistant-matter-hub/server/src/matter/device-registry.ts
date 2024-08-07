import { DeviceBase, MatterRegistry } from '@home-assistant-matter-hub/core';

export class DeviceRegistry implements MatterRegistry {
  readonly devices: DeviceBase[] = [];

  register(device: DeviceBase): Promise<void> {
    this.devices.push(device);
    throw new Error('Method not implemented.');
  }

  unregister(device: DeviceBase): Promise<void> {
    this.devices.splice(this.devices.indexOf(device), 1);
    throw new Error('Method not implemented.');
  }
}
