import { HassEntity } from 'home-assistant-js-websocket';
import { DeviceTypes } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { OnOffAspect } from './aspects/on-off-aspect.js';

export class SwitchDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: HassEntity, isOn?: (state: HassEntity) => boolean) {
    super(entity, DeviceTypes.ON_OFF_PLUGIN_UNIT);
    this.addAspect(new OnOffAspect(homeAssistantClient, this.matter, entity, isOn));
  }
}
