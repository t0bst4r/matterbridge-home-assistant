import { DeviceTypeDefinition, MatterbridgeDevice } from 'matterbridge';

import { AspectBase } from '@/aspects/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

export interface InternalBinarySensorDeviceConfig {
  deviceType: DeviceTypeDefinition;
  createAspects: (device: MatterbridgeDevice, entity: HomeAssistantMatterEntity) => AspectBase[];
}
