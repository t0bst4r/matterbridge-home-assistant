import { DeviceTypes } from 'matterbridge';

import { ColorControlAspect, IdentifyAspect, LevelControlAspect, OnOffAspect } from '@/aspects/index.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { DeviceBase, DeviceBaseConfig } from './device-base.js';
import { LightEntityColorMode } from './light/index.js';

const brightnessModes: LightEntityColorMode[] = Object.values(LightEntityColorMode)
  .filter((mode) => mode !== LightEntityColorMode.UNKNOWN)
  .filter((mode) => mode !== LightEntityColorMode.ONOFF);

const colorModes: LightEntityColorMode[] = [
  LightEntityColorMode.HS,
  LightEntityColorMode.RGB,
  LightEntityColorMode.XY,
  // TODO: ColorMode.RGBW, not yet supported
  // TODO: ColorMode.RGBWW, not yet supported
];

export { LightEntityColorMode } from './light/light-entity-color-mode.js';

export class LightDevice extends DeviceBase {
  constructor(homeAssistantClient: HomeAssistantClient, entity: HomeAssistantMatterEntity, config: DeviceBaseConfig) {
    super(entity, DeviceTypes.ON_OFF_LIGHT, config);

    const supportedColorModes: LightEntityColorMode[] = entity.attributes.supported_color_modes ?? [];

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(new OnOffAspect(homeAssistantClient, this.matter, entity));

    this.addAspect(
      new ColorControlAspect(homeAssistantClient, this.matter, entity, {
        supportsColorControl: supportedColorModes.some((mode) => colorModes.includes(mode)),
        supportsColorTemperature: supportedColorModes.includes(LightEntityColorMode.COLOR_TEMP),
      }),
    );

    if (supportedColorModes.some((mode) => brightnessModes.includes(mode))) {
      this.addAspect(
        new LevelControlAspect(homeAssistantClient, this.matter, entity, {
          getValue: (entity) => entity.attributes.brightness,
          moveToLevel: {
            service: 'light.turn_on',
            data: (brightness) => ({ brightness }),
          },
        }),
      );
    }
  }
}
