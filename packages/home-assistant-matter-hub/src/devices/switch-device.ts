import { DeviceTypes } from 'matterbridge';

import { IdentifyAspect, OnOffAspect } from '@/aspects/index.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { DeviceBase } from './device-base.js';

export class SwitchDevice extends DeviceBase {
  constructor(
    homeAssistantClient: HomeAssistantClient,
    entity: HomeAssistantMatterEntity,
    isOn?: (state: HomeAssistantMatterEntity) => boolean,
  ) {
    super(entity, DeviceTypes.ON_OFF_PLUGIN_UNIT);
    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(new OnOffAspect(homeAssistantClient, this.matter, entity, { isOn }));
  }
}
