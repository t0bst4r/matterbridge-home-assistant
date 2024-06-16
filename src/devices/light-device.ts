import { DeviceTypes, MatterbridgeDevice } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { OnOffAspect } from './aspects/on-off-aspect.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { LevelControlAspect } from './aspects/level-control-aspect.js';
import { ColorControlAspect } from './aspects/color-control-aspect.js';

export class LightDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: Entity) {
    const device = new MatterbridgeDevice(DeviceTypes.ON_OFF_LIGHT);
    super(entity, device);

    this.addAspect(new OnOffAspect(homeAssistantClient, device, entity));
    this.addAspect(new LevelControlAspect(homeAssistantClient, device, entity));
    this.addAspect(new ColorControlAspect(homeAssistantClient, device, entity));
  }
}
