import { DeviceTypes } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { LevelControlAspect } from './aspects/level-control-aspect.js';
import { IdentifyAspect } from './aspects/identify-aspect.js';

export class ClimateDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: Entity) {
    super(entity, DeviceTypes.HEATING_COOLING_UNIT);

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(
      new LevelControlAspect(homeAssistantClient, this.matter, entity, {
        getValue: (entity) => entity.attributes.brightness,
        getMinValue: (entity) => entity.attributes.min_temp,
        getMaxValue: (entity) => entity.attributes.max_temp,
        moveToLevel: {
          service: 'climate.set_temperature',
          data: (temperature) => ({ temperature }),
        },
      }),
    );
  }
}
