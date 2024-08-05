import { ColorControl, ColorControlCluster } from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';
import type Color from 'color';

import {
  clusterWithColor,
  clusterWithColorAndTemperature,
  clusterWithTemperature,
  ColorControlHandlers,
} from '@/aspects/utils/color-control-cluster.js';
import { LightEntityColorMode } from '@/devices/index.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';
import { ColorConverter } from './utils/color-converter.js';

export interface ColorControlAspectConfig {
  supportsColorControl: boolean;
  supportsColorTemperature: boolean;
}

const HueSaturationCluster = ColorControlCluster.with(ColorControl.Feature.HueSaturation);
const TemperatureCluster = ColorControlCluster.with(ColorControl.Feature.ColorTemperature);

export class ColorControlAspect extends AspectBase {
  private readonly supportsColorControl: boolean;
  private readonly supportsColorTemperature: boolean;

  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: Device,
    entity: HomeAssistantMatterEntity,
    config: ColorControlAspectConfig,
  ) {
    super('ColorControlAspect', entity);
    this.supportsColorControl = config.supportsColorControl;
    this.supportsColorTemperature = config.supportsColorTemperature;

    if (this.supportsColorControl && this.supportsColorTemperature) {
      device.addClusterServer(
        clusterWithColorAndTemperature(
          this.log,
          this.moveToHueAndSaturation.bind(this),
          this.moveToColorTemperature.bind(this),
        ),
      );
    } else if (this.supportsColorControl) {
      device.addClusterServer(clusterWithColor(this.log, this.moveToHueAndSaturation.bind(this)));
    } else if (this.supportsColorTemperature) {
      device.addClusterServer(clusterWithTemperature(this.log, this.moveToColorTemperature.bind(this)));
    }
  }

  async update(state: HomeAssistantMatterEntity) {
    const color = this.getHomeAssistantColor(state);

    if (
      this.supportsColorTemperature &&
      state.attributes.color_mode === LightEntityColorMode.COLOR_TEMP &&
      state.attributes.color_temp_kelvin != null
    ) {
      const temperatureMireds = ColorConverter.temperatureKelvinToMireds(state.attributes.color_temp_kelvin);
      const temperatureControlCluster = this.device.getClusterServer(TemperatureCluster)!;
      if (temperatureControlCluster.getColorTemperatureMiredsAttribute() !== temperatureMireds) {
        this.log.debug('FROM HA: changed (matter) color temperature to %s mireds', this.entityId, temperatureMireds);
        temperatureControlCluster.setColorTemperatureMiredsAttribute(temperatureMireds);
      }
    } else if (this.supportsColorControl && color != null) {
      const [hue, saturation] = ColorConverter.toMatterHS(color);
      const colorControlCluster = this.device.getClusterServer(HueSaturationCluster)!;
      if (colorControlCluster.getCurrentHueAttribute() !== hue) {
        this.log.debug('FROM HA: %s changed (matter) hue to %s', this.entityId, hue);
        colorControlCluster.setCurrentHueAttribute(hue);
      }
      if (colorControlCluster.getCurrentSaturationAttribute() !== saturation) {
        this.log.debug('FROM HA: %s changed (matter) saturation to %s', this.entityId, saturation);
        colorControlCluster.setCurrentSaturationAttribute(saturation);
      }
    }
  }

  private moveToColorTemperature: ColorControlHandlers['moveToColorTemperature'] = async ({
    request: { colorTemperatureMireds },
  }) => {
    if (!this.supportsColorTemperature) {
      return;
    }
    const colorTemperatureKelvin = ColorConverter.temperatureMiredsToKelvin(colorTemperatureMireds);
    this.log.debug(
      'FROM MATTER: %s changed color temperature to %s mireds / %s K',
      this.entityId,
      colorTemperatureMireds,
      colorTemperatureKelvin,
    );

    const colorControlCluster = this.device.getClusterServer(TemperatureCluster)!;
    colorControlCluster?.setColorTemperatureMiredsAttribute(colorTemperatureMireds);
    await this.setHomeAssistantTemperature(colorTemperatureKelvin);
  };

  private moveToHueAndSaturation: ColorControlHandlers['moveToHueAndSaturation'] = async ({
    request: { hue, saturation },
  }) => {
    if (!this.supportsColorControl) {
      return;
    }

    this.log.debug(
      'FROM MATTER: %s changed (matter) hue to %s and (matter) saturation to %s',
      this.entityId,
      hue,
      saturation,
    );
    const colorControlCluster = this.device.getClusterServer(HueSaturationCluster)!;
    colorControlCluster?.setCurrentHueAttribute(hue);
    colorControlCluster?.setCurrentSaturationAttribute(saturation);

    const color = ColorConverter.fromMatterHS(hue, saturation);
    await this.setHomeAssistantColor(color);
  };

  private getHomeAssistantColor(entity: HomeAssistantMatterEntity): Color | undefined {
    const hsColor: [number, number] | undefined = entity.attributes.hs_color;
    const xyColor: [number, number] | undefined = entity.attributes.xy_color;
    const rgbColor: [number, number, number] | undefined = entity.attributes.rgb_color;
    if (hsColor != null) {
      const [hue, saturation] = hsColor;
      return ColorConverter.fromHomeAssistantHS(hue, saturation);
    } else if (rgbColor != null) {
      const [r, g, b] = rgbColor;
      return ColorConverter.fromRGB(r, g, b);
    } else if (xyColor != null) {
      const [x, y] = xyColor;
      return ColorConverter.fromXY(x, y);
    }
    return undefined;
  }

  private async setHomeAssistantTemperature(temperatureKelvin: number): Promise<void> {
    this.log.debug('SET Color Temperature: %s, %s K', this.entityId, temperatureKelvin);
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
    const [hue, saturation] = ColorConverter.toHomeAssistantHS(color);
    this.log.debug('SET HS: %s, (HA) hue: %s, (HA) saturation: %s', this.entityId, hue, saturation);
    await this.homeAssistantClient.callService(
      'light',
      'turn_on',
      {
        hs_color: [hue, saturation],
      },
      { entity_id: this.entityId },
    );
  }
}
