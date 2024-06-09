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

export class LightDevice extends HomeAssistantDevice {
  private readonly supportsLevelControl: boolean;
  private readonly supportsColorControl: boolean;

  constructor(homeAssistantClient: HomeAssistantClient, entity: HassEntity) {
    super(homeAssistantClient, entity, DeviceTypes.ON_OFF_LIGHT);

    this.supportsLevelControl = entity.attributes.supported_color_modes?.includes('brightness') ?? false;
    this.supportsColorControl = entity.attributes.supported_color_modes?.includes('hs_color') ?? false;

    this.createDefaultIdentifyClusterServer();
    this.addCommandHandler('identify', this.identify.bind(this));

    this.createDefaultOnOffClusterServer();
    this.addCommandHandler('on', this.turnOn.bind(this));
    this.addCommandHandler('off', this.turnOff.bind(this));

    if (this.supportsLevelControl) {
      this.createDefaultLevelControlClusterServer();
      this.addCommandHandler('moveToLevel', this.moveToLevel.bind(this));
      this.addCommandHandler('moveToLevelWithOnOff', this.moveToLevel.bind(this));
    }

    if (this.supportsColorControl) {
      this.createDefaultColorControlClusterServer();
      this.addCommandHandler('moveToHueAndSaturation', this.moveToHueAndSaturation.bind(this));
    }
  }

  async updateState(state: HassEntity) {
    const onOffClusterServer = this.getClusterServer(OnOffCluster)!;
    if (onOffClusterServer.getOnOffAttribute() !== (state.state === 'on')) {
      onOffClusterServer.setOnOffAttribute(state.state === 'on');
    }

    if (this.supportsLevelControl) {
      const levelControlClusterServer = this.getClusterServer(LevelControlCluster)!;
      if (levelControlClusterServer.getCurrentLevelAttribute() !== state.attributes.brightness) {
        levelControlClusterServer.setCurrentLevelAttribute(state.attributes.brightness ?? 0);
      }
    }

    if (this.supportsColorControl) {
      const [hue, saturation] = state.attributes.hs_color;
      const colorControlCluster = this.getClusterServer(ColorControlCluster.with(MColorControl.Feature.HueSaturation))!;
      if (colorControlCluster.getCurrentHueAttribute() !== hue) {
        colorControlCluster.setCurrentHueAttribute(hue);
      }
      if (colorControlCluster.getCurrentSaturationAttribute() !== saturation) {
        colorControlCluster.setCurrentSaturationAttribute(saturation);
      }
    }
  }

  private identify: MatterbridgeDeviceCommands['identify'] = async ({ request: { identifyTime } }) => {
    this.log.info(`Command identify called, identifyTime: ${identifyTime}`);
  };

  private turnOn: MatterbridgeDeviceCommands['on'] = async () => {
    this.getClusterServer(OnOffCluster)?.setOnOffAttribute(true);
    await this.callService('light', 'turn_on', {}, { entity_id: this.entityId });
  };

  private turnOff: MatterbridgeDeviceCommands['off'] = async () => {
    this.getClusterServer(OnOffCluster)?.setOnOffAttribute(false);
    await this.callService('light', 'turn_off', {}, { entity_id: this.entityId });
  };

  private moveToLevel: MatterbridgeDeviceCommands['moveToLevel'] = async ({
    request: { level },
    attributes: { currentLevel },
  }) => {
    this.getClusterServer(LevelControlCluster)?.setCurrentLevelAttribute(level);
    this.log.debug(`moveToLevel: ${level}, current level: ${currentLevel?.getLocal()}`);
    await this.callService(
      'light',
      'turn_on',
      {
        brightness: level,
      },
      { entity_id: this.entityId },
    );
  };

  private moveToHueAndSaturation: MatterbridgeDeviceCommands['moveToHueAndSaturation'] = async ({
    request: { hue, saturation },
    attributes: { currentHue, currentSaturation },
  }) => {
    const colorControlCluster = this.getClusterServer(ColorControlCluster.with(MColorControl.Feature.HueSaturation));
    colorControlCluster?.setCurrentHueAttribute(hue);
    colorControlCluster?.setCurrentSaturationAttribute(saturation);
    this.log.debug(
      `moveToHueAndSaturation: hue ${hue}, saturation ${saturation},` +
        `current: hue ${currentHue?.getLocal()}, saturation ${currentSaturation?.getLocal()}`,
    );
    await this.callService(
      'light',
      'turn_on',
      {
        hs_color: [hue, saturation],
      },
      { entity_id: this.entityId },
    );
  };
}
