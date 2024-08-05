import { DeviceTypes } from '@project-chip/matter.js/device';

import { DoorLockAspect, IdentifyAspect } from '@/aspects/index.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { DeviceBase, DeviceBaseConfig } from './device-base.js';

export class LockDevice extends DeviceBase {
  constructor(homeAssistantClient: HomeAssistantClient, entity: HomeAssistantMatterEntity, config: DeviceBaseConfig) {
    super(entity, DeviceTypes.DOOR_LOCK, config);

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(new DoorLockAspect(homeAssistantClient, this.matter, entity));
  }
}
