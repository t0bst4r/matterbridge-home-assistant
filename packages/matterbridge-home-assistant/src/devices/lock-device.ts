import { HomeAssistantDevice } from './home-assistant-device.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { DeviceTypes } from 'matterbridge';
import { IdentifyAspect } from './aspects/identify-aspect.js';
import { DoorLockAspect } from './aspects/door-lock-aspect.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';

export class LockDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: Entity) {
    super(entity, DeviceTypes.DOOR_LOCK);

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(new DoorLockAspect(homeAssistantClient, this.matter, entity));
  }
}
