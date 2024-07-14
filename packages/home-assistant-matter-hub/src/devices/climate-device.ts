import { DeviceTypes } from 'matterbridge';

import { IdentifyAspect, LevelControlAspect } from '@/aspects/index.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { DeviceBase, DeviceBaseConfig } from './device-base.js';

export class ClimateDevice extends DeviceBase {
  constructor(homeAssistantClient: HomeAssistantClient, entity: HomeAssistantMatterEntity, config: DeviceBaseConfig) {
    super(entity, DeviceTypes.HEATING_COOLING_UNIT, config);

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(
      new LevelControlAspect(homeAssistantClient, this.matter, entity, {
        getValue: (entity) => entity.attributes.temperature,
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
