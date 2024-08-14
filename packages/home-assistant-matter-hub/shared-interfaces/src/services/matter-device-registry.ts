import { MatterDevice } from '../models/index.js';
import { MatterEndpointDevice } from '../models/matter-endpoint-device.js';

export interface MatterDeviceRegistry {
  get devices(): MatterDevice[];

  register(device: MatterEndpointDevice): Promise<void>;

  unregister(device: MatterEndpointDevice): Promise<void>;
}
