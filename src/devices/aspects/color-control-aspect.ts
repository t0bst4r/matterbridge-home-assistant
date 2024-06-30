import { ClusterServer, ClusterServerHandlers, ColorControl } from '@project-chip/matter.js/cluster';
import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { HomeAssistantClient } from '../../home-assistant/home-assistant-client.js';
import { ColorConverter } from '../../util/color-converter.js';
import { HassEntity } from 'home-assistant-js-websocket';
import type Color from 'color';
import { LightEntityColorMode } from '../light-entity-color-mode.js';
import { HomeAssistantDevice } from '../home-assistant-device.js';
import { ClusterController } from '../../util/cluster-controller.js';

export const colorModes = [
  LightEntityColorMode.HS,
  LightEntityColorMode.RGB,
  // TODO: ColorMode.RGBW, not yet supported
  // TODO: ColorMode.RGBWW, not yet supported
  // TODO: ColorMode.XY, not yet supported
];

export class ColorControlAspect extends MatterAspect<Entity> {
  private readonly supportedColorModes: LightEntityColorMode[];

  private get clusterServer(): ClusterController<typeof ColorControl.CompleteInstance> {
    return this.device.getClusterServer(ColorControl.CompleteInstance)!;
  }

  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: HomeAssistantDevice,
    entity: Entity,
  ) {
    super(`${entity.entity_id}/ColorControl`);

    const supportedColorModes = entity.attributes.supported_color_modes ?? [];
    this.device.addClusterServer(
      this.createClusterServer(
        includesAny(supportedColorModes, [LightEntityColorMode.HS, LightEntityColorMode.RGB]),
        supportedColorModes.includes(LightEntityColorMode.XY),
        supportedColorModes.includes(LightEntityColorMode.COLOR_TEMP),
      ),
    );
  }

  async update(state: Entity) {
    const color = this.getHomeAssistantColor(state);
    if (this.supportsHueAndSaturation && color != null) {
      const [hue, saturation] = ColorConverter.toMatterHS(color);
      const colorControlCluster = this.hsColorControlCluster!;
      if (colorControlCluster.getCurrentHueAttribute() !== hue) {
        this.log.debug(`FROM HA: ${this.device.entityId} changed (matter) hue to ${hue}`);
        colorControlCluster.setCurrentHueAttribute(hue);
      }
      if (colorControlCluster.getCurrentSaturationAttribute() !== saturation) {
        this.log.debug(`FROM HA: ${this.device.entityId} changed (matter) saturation to ${saturation}`);
        colorControlCluster.setCurrentSaturationAttribute(saturation);
      }
    }

    const colorTempKelvin: number | undefined = state.attributes.color_temp_kelvin;
    if (this.supportsHueAndSaturation && this.supportsColorTemperature && colorTempKelvin != null) {
      const temperatureMireds = ColorConverter.temperatureKelvinToMireds(colorTempKelvin);
      const temperatureControlCluster = this.tempColorControlCluster!;
      if (temperatureControlCluster.getColorTemperatureMiredsAttribute() !== temperatureMireds) {
        this.log.debug(
          `FROM HA: ${this.device.entityId} changed (matter) color temperature to ${temperatureMireds} mireds`,
        );
        temperatureControlCluster.setColorTemperatureMiredsAttribute(temperatureMireds);
      }
    }
  }

  private anyTest() {
    this.clusterServer.setCurrentHueAttribute = 5;
    this.clusterServer.setCurrentHueAttribute(23);
    this.clusterServer.getCurrentHueAttribute();
  }

  private moveToHueAndSaturation: ClusterServerHandlers<
    typeof ColorControl.CompleteInstance
  >['moveToHueAndSaturation'] = async ({ request: { hue, saturation } }) => {
    this.log.debug(
      `FROM MATTER: ${this.device.entityId} changed (matter) hue to ${hue} and (matter) saturation to ${saturation}`,
    );

    this.clusterServer.setCurrentHueAttribute(23);
    this.clusterServer.setCurrentSaturationAttribute(saturation);

    await this.setHomeAssistantColor(hue, saturation);
  };

  private moveToColorTemperature: ClusterServerHandlers<
    typeof ColorControl.CompleteInstance
  >['moveToColorTemperature'] = async ({ request: { colorTemperatureMireds } }) => {
    const colorTemperatureKelvin = ColorConverter.temperatureMiredsToKelvin(colorTemperatureMireds);
    this.log.debug(
      `FROM MATTER: ${this.device.entityId} changed color temperature to ${colorTemperatureMireds} mireds / ${colorTemperatureKelvin} K`,
    );

    const colorControlCluster = this.clusterServer!;
    colorControlCluster.setColorTemperatureMiredsAttribute(colorTemperatureMireds);
    await this.setHomeAssistantTemperature(colorTemperatureKelvin);
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
    this.log.debug(`SET Color Temperature: ${this.device.entityId}, ${temperatureKelvin} K`);
    await this.homeAssistantClient.callService(
      'light',
      'turn_on',
      {
        color_temp_kelvin: temperatureKelvin,
      },
      { entity_id: this.device.entityId },
    );
  }

  private async setHomeAssistantColor(matterHue: number, matterSaturation: number): Promise<void> {
    const color = ColorConverter.fromMatterHS(matterHue, matterSaturation);
    if (this.supportedColorModes.includes(LightEntityColorMode.HS)) {
      await this.setHomeAssistantHS(color);
    } else if (this.supportedColorModes.includes(LightEntityColorMode.RGB)) {
      await this.setHomeAssistantRGB(color);
    } else {
      throw new Error(`Could not find the correct color mode for ${this.device.entityId}`);
    }
  }

  private async setHomeAssistantHS(color: Color): Promise<void> {
    const [hue, saturation] = ColorConverter.toHomeAssistantHS(color);
    this.log.debug(`SET HS: ${this.device.entityId}, (HA) hue: ${hue}, (HA) saturation: ${saturation}`);
    await this.homeAssistantClient.callService(
      'light',
      'turn_on',
      {
        hs_color: [hue, saturation],
      },
      { entity_id: this.device.entityId },
    );
  }

  private async setHomeAssistantRGB(color: Color): Promise<void> {
    const rgbColor = ColorConverter.toRGB(color);
    this.log.debug(`SET RGB: ${this.device.entityId}, rgb: ${rgbColor.join(', ')}`);
    await this.homeAssistantClient.callService(
      'light',
      'turn_on',
      {
        rgb_color: rgbColor,
      },
      { entity_id: this.device.entityId },
    );
  }

  private createClusterServer(supportsHue: boolean, supportsXy: boolean, supportsColorTemp: boolean) {
    return ClusterServer(
      ColorControl.CompleteInstance,
      {
        colorMode: ColorControl.ColorMode.CurrentHueAndCurrentSaturation,
        enhancedColorMode: ColorControl.EnhancedColorMode.CurrentHueAndCurrentSaturation,
        options: {
          executeIfOff: false,
        },
        numberOfPrimaries: 12,
        colorCapabilities: {
          hueSaturation: supportsHue,
          enhancedHue: false,
          colorLoop: false,
          xy: supportsXy,
          colorTemperature: supportsColorTemp,
        },
      },
      {
        moveToHueAndSaturation: this.moveToHueAndSaturation.bind(this),
        moveToColorTemperature: this.moveToColorTemperature.bind(this),
        moveToColor: this.moveToXyColor.bind(this),
      },
      {},
    );
  }
}

function includesAny<T>(a: T[], b: T[]) {
  return a.some((it) => b.includes(it));
}
