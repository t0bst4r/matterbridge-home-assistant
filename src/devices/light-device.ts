import { DeviceTypes } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { OnOffAspect } from './aspects/on-off-aspect.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { LevelControlAspect } from './aspects/level-control-aspect.js';
import { ColorControlAspect } from './aspects/color-control-aspect.js';
import { IdentifyAspect } from './aspects/identify-aspect.js';
import { LightEntityColorMode } from './light-entity-color-mode.js';

const brightnessModes: LightEntityColorMode[] = Object.values(LightEntityColorMode)
  .filter((mode) => mode !== LightEntityColorMode.UNKNOWN)
  .filter((mode) => mode !== LightEntityColorMode.ONOFF);

export class LightDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: Entity) {
    super(entity, DeviceTypes.ON_OFF_LIGHT);

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(new OnOffAspect(homeAssistantClient, this.matter, entity));
    this.addAspect(new ColorControlAspect(homeAssistantClient, this.matter, entity));

    this.configureLevelControl(homeAssistantClient, entity);
  }

  private configureLevelControl(homeAssistantClient: HomeAssistantClient, entity: Entity) {
    const supportedColorModes: LightEntityColorMode[] = entity.attributes.supported_color_modes ?? [];
    const supportsLevelControl = supportedColorModes.some((mode) => brightnessModes.includes(mode));
    if (supportsLevelControl) {
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
