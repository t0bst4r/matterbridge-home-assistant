import { DeviceTypes } from '@project-chip/matter.js/device';

import { DeviceBase, DeviceBaseConfig } from './device-base.js';

import { IdentifyAspect, OnOffAspect } from '../aspects/index.js';
import { HomeAssistantClient } from '../home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '../models/index.js';

export interface SwitchDeviceConfig extends DeviceBaseConfig {
  readonly isOn?: (state: HomeAssistantMatterEntity) => boolean;
}

export class SwitchDevice extends DeviceBase {
  constructor(homeAssistantClient: HomeAssistantClient, entity: HomeAssistantMatterEntity, config: SwitchDeviceConfig) {
    super(entity, DeviceTypes.ON_OFF_PLUGIN_UNIT, config);
    this.addAspect(new IdentifyAspect(this.endpoint, entity));
    this.addAspect(new OnOffAspect(homeAssistantClient, this.endpoint, entity, { isOn: config.isOn }));
  }
}
