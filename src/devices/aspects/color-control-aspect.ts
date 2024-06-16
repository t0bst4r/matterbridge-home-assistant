import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { HomeAssistantClient } from '../../home-assistant/home-assistant-client.js';
import { ColorControl as MColorControl, ColorControlCluster, MatterbridgeDevice } from 'matterbridge';
import { MatterbridgeDeviceCommands } from '../../util/matterbrigde-device-commands.js';
import { ColorConverter } from '../../util/color-converter.js';
import { HassEntity } from 'home-assistant-js-websocket';
import type Color from 'color';
import { LightEntityColorMode } from '../light-entity-color-mode.js';

export const colorModes = [
  LightEntityColorMode.HS,
  LightEntityColorMode.RGB,
  // TODO: ColorMode.RGBW, not yet supported
  // TODO: ColorMode.RGBWW, not yet supported
  // TODO: ColorMode.XY, not yet supported
];

export class ColorControlAspect extends MatterAspect<Entity> {
  private readonly supportsColorControl: boolean;
  private readonly supportsColorTemperature: boolean;
  private readonly supportedColorModes: LightEntityColorMode[];

  get hsColorControlCluster() {
    return this.device.getClusterServer(ColorControlCluster.with(MColorControl.Feature.HueSaturation));
  }

  get tempColorControlCluster() {
    return this.device.getClusterServer(ColorControlCluster.with(MColorControl.Feature.ColorTemperature));
  }

  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: Entity,
  ) {
    super(entity.entity_id);
    this.log.setLogName('ColorControlAspect');
    this.supportedColorModes = entity.attributes.supported_color_modes ?? [];
    this.supportsColorControl = this.supportedColorModes.some((mode) => colorModes.includes(mode));
    this.supportsColorTemperature = this.supportedColorModes.includes(LightEntityColorMode.COLOR_TEMP);

    if (this.supportsColorControl) {
      this.log.debug(`Light-Entity ${entity.entity_id} supports color control`);
      device.createDefaultColorControlClusterServer();
      device.addCommandHandler('moveToHueAndSaturation', this.moveToHueAndSaturation.bind(this));
      device.addCommandHandler('moveToColorTemperature', this.moveToColorTemperature.bind(this));
    }
  }

  async update(state: Entity) {
    const color = this.getHomeAssistantColor(state);
    if (this.supportsColorControl && color != null) {
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
    }

    const colorTempKelvin: number | undefined = state.attributes.color_temp_kelvin;
    if (this.supportsColorControl && this.supportsColorTemperature && colorTempKelvin != null) {
      const temperatureMireds = ColorConverter.temperatureKelvinToMireds(colorTempKelvin);
      const temperatureControlCluster = this.tempColorControlCluster!;
      if (temperatureControlCluster.getColorTemperatureMiredsAttribute() !== temperatureMireds) {
        this.log.debug(`FROM HA: ${this.entityId} changed (matter) color temperature to ${temperatureMireds} mireds`);
        temperatureControlCluster.setColorTemperatureMiredsAttribute(temperatureMireds);
      }
    }
  }

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

  private getHomeAssistantColor(entity: HassEntity): Color | undefined {
    const hsColor: [number, number] | undefined = entity.attributes.hs_color;
    const rgbColor: [number, number, number] | undefined = entity.attributes.rgb_color;
    if (this.supportedColorModes.includes(LightEntityColorMode.HS) && hsColor != null) {
      const [hue, saturation] = hsColor;
      return ColorConverter.fromHomeAssistantHS(hue, saturation);
    } else if (this.supportedColorModes.includes(LightEntityColorMode.RGB) && rgbColor != null) {
      const [r, g, b] = rgbColor;
      return ColorConverter.fromRGB(r, g, b);
    }
    return undefined;
  }

  private async setHomeAssistantTemperature(temperatureKelvin: number): Promise<void> {
    this.log.debug(`SET Color Temperature: ${this.entityId}, ${temperatureKelvin} K`);
    await this.homeAssistantClient.callService(
      'light',
      'turn_on',
      {
        color_temp_kelvin: temperatureKelvin,
      },
      { entity_id: this.entityId },
    );
  }

  private async setHomeAssistantColor(color: Color): Promise<void> {
    if (this.supportedColorModes.includes(LightEntityColorMode.HS)) {
      await this.setHomeAssistantHS(color);
    } else if (this.supportedColorModes.includes(LightEntityColorMode.RGB)) {
      await this.setHomeAssistantRGB(color);
    } else {
      throw new Error(`Could not find the correct color mode for ${this.entityId}`);
    }
  }

  private async setHomeAssistantHS(color: Color): Promise<void> {
    const [hue, saturation] = ColorConverter.toHomeAssistantHS(color);
    this.log.debug(`SET HS: ${this.entityId}, (HA) hue: ${hue}, (HA) saturation: ${saturation}`);
    await this.homeAssistantClient.callService(
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
    await this.homeAssistantClient.callService(
      'light',
      'turn_on',
      {
        rgb_color: rgbColor,
      },
      { entity_id: this.entityId },
    );
  }
}
