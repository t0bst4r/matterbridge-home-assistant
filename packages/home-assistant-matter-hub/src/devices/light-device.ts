import { DeviceTypeDefinition, DeviceTypes } from 'matterbridge';

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
    const supportedColorModes: LightEntityColorMode[] = entity.attributes.supported_color_modes ?? [];
    const supportsBrightness = supportedColorModes.some((mode) => brightnessModes.includes(mode));
    const supportsColorControl = supportedColorModes.some((mode) => colorModes.includes(mode));
    const supportsColorTemperature = supportedColorModes.includes(LightEntityColorMode.COLOR_TEMP);

    let deviceType: DeviceTypeDefinition;
    if (supportsColorControl) {
      deviceType = DeviceTypes.EXTENDED_COLOR_LIGHT;
    } else if (supportsColorTemperature) {
      deviceType = DeviceTypes.COLOR_TEMPERATURE_LIGHT;
    } else if (supportsBrightness) {
      deviceType = DeviceTypes.DIMMABLE_LIGHT;
    } else {
      deviceType = DeviceTypes.ON_OFF_LIGHT;
    }

    super(entity, deviceType, config);

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(new OnOffAspect(homeAssistantClient, this.matter, entity));

    if (supportsColorControl || supportsColorTemperature) {
      this.addAspect(
        new ColorControlAspect(homeAssistantClient, this.matter, entity, {
          supportsColorControl,
          supportsColorTemperature,
        }),
      );
    }

    if (supportsBrightness) {
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
