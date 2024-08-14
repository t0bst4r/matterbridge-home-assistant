import type { Device } from '@project-chip/matter.js/device';

import { MatterDevice } from './matter-device.js';

export interface MatterEndpointDevice extends MatterDevice {
  endpoint: Device;
}
