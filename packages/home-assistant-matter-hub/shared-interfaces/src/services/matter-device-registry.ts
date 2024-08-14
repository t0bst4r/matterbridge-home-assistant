import { MatterDevice } from '../models/index.js';

export interface MatterDeviceRegistry {
  get devices(): MatterDevice[];

  register(device: MatterDevice): Promise<void>;

  unregister(device: MatterDevice): Promise<void>;
}
