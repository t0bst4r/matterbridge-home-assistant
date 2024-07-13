import { HassEntity } from 'home-assistant-js-websocket';
import { DeviceTypes } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { OnOffAspect } from './aspects/on-off-aspect.js';
import { IdentifyAspect } from './aspects/identify-aspect.js';
import { Entity } from '../home-assistant/entity/entity.js';

export class SwitchDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: Entity, isOn?: (state: HassEntity) => boolean) {
    super(entity, DeviceTypes.ON_OFF_PLUGIN_UNIT);
    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(new OnOffAspect(homeAssistantClient, this.matter, entity, { isOn }));
  }
}
