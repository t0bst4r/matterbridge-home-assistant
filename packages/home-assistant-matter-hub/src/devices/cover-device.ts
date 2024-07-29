import { DeviceTypes } from 'matterbridge';

import { IdentifyAspect, WindowCoveringAspect } from '@/aspects/index.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { DeviceBase, DeviceBaseConfig } from './device-base.js';

export class CoverDevice extends DeviceBase {
  constructor(client: HomeAssistantClient, entity: HomeAssistantMatterEntity, config: DeviceBaseConfig) {
    super(entity, DeviceTypes.WINDOW_COVERING, config);

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(new WindowCoveringAspect(client, entity, this.matter));
  }
}
