import { DeviceTypes } from '@project-chip/matter.js/device';

import { IdentifyAspect } from '@/aspects/index.js';
import { ThermostatAspect } from '@/aspects/thermostat-aspect.js';
import { HvacMode } from '@/devices/climate/hvac-mode.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { DeviceBase, DeviceBaseConfig } from './device-base.js';

export class ClimateDevice extends DeviceBase {
  constructor(homeAssistantClient: HomeAssistantClient, entity: HomeAssistantMatterEntity, config: DeviceBaseConfig) {
    super(entity, DeviceTypes.THERMOSTAT, config);

    const supportedModes = entity.attributes.hvac_modes as HvacMode[];

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(
      new ThermostatAspect(homeAssistantClient, this.matter, entity, {
        supportsHeating: [HvacMode.heat, HvacMode.heat_cool].some((mode) => supportedModes.includes(mode)),
        supportsCooling: [HvacMode.cool, HvacMode.heat_cool].some((mode) => supportedModes.includes(mode)),
      }),
    );
  }
}
