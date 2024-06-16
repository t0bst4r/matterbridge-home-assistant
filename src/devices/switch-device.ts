import { HassEntity } from 'home-assistant-js-websocket';
import { DeviceTypes } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { OnOffAspect } from './aspects/on-off-aspect.js';
import { MatterbridgeDevice } from 'matterbridge/dist';

export class SwitchDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: HassEntity, isOn?: (state: HassEntity) => boolean) {
    const device = new MatterbridgeDevice(DeviceTypes.ON_OFF_PLUGIN_UNIT);
    super(entity, device);
    this.addAspect(new OnOffAspect(homeAssistantClient, device, entity, isOn ?? ((state) => state.state !== 'off')));
  }
}
