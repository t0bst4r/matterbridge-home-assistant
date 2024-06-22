import { DeviceTypes } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { IdentifyAspect } from './aspects/identify-aspect.js';

export class ClimateDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: Entity) {
    super(entity, DeviceTypes.THERMOSTAT);

    this.addAspect(new IdentifyAspect(this.matter, entity));

    // TODO
    this.matter.createDefaultThermostatClusterServer();
    console.log(homeAssistantClient !== null);
  }
}
