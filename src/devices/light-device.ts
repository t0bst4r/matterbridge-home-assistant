import { HassEntity } from 'home-assistant-js-websocket';
import {
  ColorControl as MColorControl,
  ColorControlCluster,
  DeviceTypes,
  LevelControlCluster,
  OnOffCluster,
} from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { MatterbridgeDeviceCommands } from '../util/matterbrigde-device-commands.js';
import type Color from 'color';
import { ColorConverter } from '../util/color-converter.js';

export enum ColorMode {
  UNKNOWN = 'unknown',
  ONOFF = 'onoff',
  BRIGHTNESS = 'brightness',
  COLOR_TEMP = 'color_temp',
  HS = 'hs',
  XY = 'xy',
  RGB = 'rgb',
  RGBW = 'rgbw',
  RGBWW = 'rgbww',
  WHITE = 'white',
}

export class LightDevice extends HomeAssistantDevice {
  private readonly supportsLevelControl: boolean;
  private readonly supportsColorControl: boolean;
  private readonly supportsColorTemperature: boolean;
  private readonly supportedColorModes: ColorMode[];

  private static readonly validColorModes = Object.values(ColorMode).filter((mode) => mode != ColorMode.UNKNOWN);
  private static readonly colorModesBrightness = this.validColorModes.filter((mode) => mode !== ColorMode.ONOFF);
  private static readonly colorModesColor = [
    ColorMode.HS,
    ColorMode.RGB,
    // TODO: ColorMode.RGBW, not yet supported
    // TODO: ColorMode.RGBWW, not yet supported
    // TODO: ColorMode.XY, not yet supported
  ];

  constructor(homeAssistantClient: HomeAssistantClient, entity: HassEntity) {
    super(homeAssistantClient, entity, DeviceTypes.ON_OFF_LIGHT);

    this.log.setLogDebug(true);

    this.supportedColorModes = entity.attributes.supported_color_modes ?? [];
    this.supportsLevelControl = this.supportedColorModes.some((mode) =>
      LightDevice.colorModesBrightness.includes(mode),
    );
    this.supportsColorControl = this.supportedColorModes.some((mode) => LightDevice.colorModesColor.includes(mode));
    this.supportsColorTemperature = this.supportedColorModes.includes(ColorMode.COLOR_TEMP);

    this.createDefaultIdentifyClusterServer();
    this.addCommandHandler('identify', this.identify.bind(this));

    this.createDefaultOnOffClusterServer();
    this.addCommandHandler('on', this.turnOn.bind(this));
    this.addCommandHandler('off', this.turnOff.bind(this));

    if (this.supportsLevelControl) {
      this.log.debug(`Light-Entity ${this.entityId} supports level control`);
      this.createDefaultLevelControlClusterServer();
      this.addCommandHandler('moveToLevel', this.moveToLevel.bind(this));
      this.addCommandHandler('moveToLevelWithOnOff', this.moveToLevel.bind(this));
    }

    if (this.supportsColorControl) {
      this.log.debug(`Light-Entity ${this.entityId} supports color control`);
      this.createDefaultColorControlClusterServer();
      this.addCommandHandler('moveToHueAndSaturation', this.moveToHueAndSaturation.bind(this));
      this.addCommandHandler('moveToColorTemperature', this.moveToColorTemperature.bind(this));
    }
  }

  get onOffCluster() {
    return this.getClusterServer(OnOffCluster);
  }

  get levelControlCluster() {
    return this.getClusterServer(LevelControlCluster);
  }

  get hsColorControlCluster() {
    return this.getClusterServer(ColorControlCluster.with(MColorControl.Feature.HueSaturation));
  }

  get tempColorControlCluster() {
    return this.getClusterServer(ColorControlCluster.with(MColorControl.Feature.ColorTemperature));
  }

  async updateState(state: HassEntity) {
    const onOffClusterServer = this.onOffCluster!;
    if (onOffClusterServer.getOnOffAttribute() !== (state.state === 'on')) {
      this.log.debug(`FROM HA: ${this.entityId} changed on-off state to ${state.state}`);
      onOffClusterServer.setOnOffAttribute(state.state === 'on');
    }

    if (this.supportsLevelControl) {
      const brightness = state.attributes.brightness;
      const levelControlClusterServer = this.levelControlCluster!;
      if (levelControlClusterServer.getCurrentLevelAttribute() !== brightness) {
        this.log.debug(`FROM HA: ${this.entityId} changed brightness to ${brightness}`);
        levelControlClusterServer.setCurrentLevelAttribute(brightness ?? 0);
      }
    }

    if (this.supportsColorControl) {
      const color = this.getHomeAssistantColor(state);
      const [hue, saturation] = ColorConverter.toMatterHS(color);
      const colorControlCluster = this.hsColorControlCluster!;
      if (colorControlCluster.getCurrentHueAttribute() !== hue) {
        this.log.debug(`FROM HA: ${this.entityId} changed (matter) hue to ${hue}`);
        colorControlCluster.setCurrentHueAttribute(hue);
      }
      if (colorControlCluster.getCurrentSaturationAttribute() !== saturation) {
        this.log.debug(`FROM HA: ${this.entityId} changed (matter) saturation to ${saturation}`);
        colorControlCluster.setCurrentSaturationAttribute(saturation);
      }

      if (this.supportsColorTemperature && state.attributes.color_temp_kelvin != null) {
        const temperatureMireds = ColorConverter.temperatureKelvinToMireds(state.attributes.color_temp_kelvin);
        const temperatureControlCluster = this.tempColorControlCluster!;
        if (temperatureControlCluster.getColorTemperatureMiredsAttribute() !== temperatureMireds) {
          this.log.debug(`FROM HA: ${this.entityId} changed (matter) color temperature to ${temperatureMireds} mireds`);
          temperatureControlCluster.setColorTemperatureMiredsAttribute(temperatureMireds);
        }
      }
    }
  }

  private identify: MatterbridgeDeviceCommands['identify'] = async ({ request: { identifyTime } }) => {
    this.log.info(`Command identify called, identifyTime: ${identifyTime}`);
  };

  private turnOn: MatterbridgeDeviceCommands['on'] = async () => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed on off state to ON`);
    this.onOffCluster!.setOnOffAttribute(true);
    await this.callService('light', 'turn_on', {}, { entity_id: this.entityId });
  };

  private turnOff: MatterbridgeDeviceCommands['off'] = async () => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed on off state to OFF`);
    this.onOffCluster!.setOnOffAttribute(false);
    await this.callService('light', 'turn_off', {}, { entity_id: this.entityId });
  };

  private moveToLevel: MatterbridgeDeviceCommands['moveToLevel'] = async ({ request: { level } }) => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed brightness to ${level}`);
    this.levelControlCluster!.setCurrentLevelAttribute(level);
    await this.callService(
      'light',
      'turn_on',
      {
        brightness: level,
      },
      { entity_id: this.entityId },
    );
  };

  private moveToColorTemperature: MatterbridgeDeviceCommands['moveToColorTemperature'] = async ({
    request: { colorTemperatureMireds },
  }) => {
    const colorTemperatureKelvin = ColorConverter.temperatureMiredsToKelvin(colorTemperatureMireds);
    this.log.debug(
      `FROM MATTER: ${this.entityId} changed color temperature to ${colorTemperatureMireds} mireds / ${colorTemperatureKelvin} K`,
    );

    if (this.supportsColorTemperature) {
      const colorControlCluster = this.tempColorControlCluster!;
      colorControlCluster?.setColorTemperatureMiredsAttribute(colorTemperatureMireds);
      await this.setHomeAssistantTemperature(colorTemperatureKelvin);
    } else {
      const color = ColorConverter.fromTemperatureKelvin(colorTemperatureKelvin);
      const colorControlCluster = this.hsColorControlCluster!;
      const [matterHue, matterSaturation] = ColorConverter.toMatterHS(color);
      colorControlCluster?.setCurrentHueAttribute(matterHue);
      colorControlCluster?.setCurrentSaturationAttribute(matterSaturation);
      await this.setHomeAssistantColor(color);
    }
  };

  private moveToHueAndSaturation: MatterbridgeDeviceCommands['moveToHueAndSaturation'] = async ({
    request: { hue, saturation },
  }) => {
    this.log.debug(
      `FROM MATTER: ${this.entityId} changed (matter) hue to ${hue} and (matter) saturation to ${saturation}`,
    );
    const colorControlCluster = this.hsColorControlCluster!;
    colorControlCluster?.setCurrentHueAttribute(hue);
    colorControlCluster?.setCurrentSaturationAttribute(saturation);

    const color = ColorConverter.fromMatterHS(hue, saturation);
    await this.setHomeAssistantColor(color);
  };

  private getHomeAssistantColor(entity: HassEntity): Color {
    if (this.supportedColorModes.includes(ColorMode.HS)) {
      const [hue, saturation] = entity.attributes.hs_color;
      return ColorConverter.fromHomeAssistantHS(hue, saturation);
    } else if (this.supportedColorModes.includes(ColorMode.RGB)) {
      const [r, g, b] = entity.attributes.rgb_color;
      return ColorConverter.fromRGB(r, g, b);
    }
    throw new Error(`Could not find the correct color mode for ${entity.entity_id}`);
  }

  private async setHomeAssistantTemperature(temperatureKelvin: number): Promise<void> {
    this.log.debug(`SET Color Temperature: ${this.entityId}, ${temperatureKelvin} K`);
    await this.callService(
      'light',
      'turn_on',
      {
        color_temp_kelvin: temperatureKelvin,
      },
      { entity_id: this.entityId },
    );
  }

  private async setHomeAssistantColor(color: Color): Promise<void> {
    if (this.supportedColorModes.includes(ColorMode.HS)) {
      await this.setHomeAssistantHS(color);
    } else if (this.supportedColorModes.includes(ColorMode.RGB)) {
      await this.setHomeAssistantRGB(color);
    } else {
      throw new Error(`Could not find the correct color mode for ${this.entityId}`);
    }
  }

  private async setHomeAssistantHS(color: Color): Promise<void> {
    const [hue, saturation] = ColorConverter.toHomeAssistantHS(color);
    this.log.debug(`SET HS: ${this.entityId}, (HA) hue: ${hue}, (HA) saturation: ${saturation}`);
    await this.callService(
      'light',
      'turn_on',
      {
        hs_color: [hue, saturation],
      },
      { entity_id: this.entityId },
    );
  }

  private async setHomeAssistantRGB(color: Color): Promise<void> {
    const rgbColor = ColorConverter.toRGB(color);
    this.log.debug(`SET RGB: ${this.entityId}, rgb: ${rgbColor.join(', ')}`);
    await this.callService(
      'light',
      'turn_on',
      {
        rgb_color: rgbColor,
      },
      { entity_id: this.entityId },
    );
  }
}
