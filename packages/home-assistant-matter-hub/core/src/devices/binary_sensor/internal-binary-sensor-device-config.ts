import { DeviceTypeDefinition, Device } from '@project-chip/matter.js/device';

import { AspectBase } from '../../aspects/index.js';
import { HomeAssistantMatterEntity } from '../../models/index.js';

export interface InternalBinarySensorDeviceConfig {
  deviceType: DeviceTypeDefinition;
  createAspects: (device: Device, entity: HomeAssistantMatterEntity) => AspectBase[];
}
