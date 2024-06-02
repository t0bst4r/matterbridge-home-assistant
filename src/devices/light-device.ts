import { ColorControl as MColorControl, ColorControlCluster, DeviceTypes, LevelControlCluster, OnOffCluster, ColorControl } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { MatterbridgeDeviceCommands } from './matterbrigde-device-commands.js';

export class LightDevice extends HomeAssistantDevice {

  constructor(name: string, entityId: string) {
    super(DeviceTypes.ON_OFF_LIGHT);
    this.createDefaultIdentifyClusterServer();
    this.createDefaultGroupsClusterServer();
    this.createDefaultScenesClusterServer();
    this.createDefaultBridgedDeviceBasicInformationClusterServer(name, this.createSerial(entityId), 0x0000, 't0bst4r', 'Light Device');
    this.createDefaultOnOffClusterServer();

    this.addCommandHandler('identify', this.identify.bind(this));
    this.addCommandHandler('on', this.turnOn.bind(this));
    this.addCommandHandler('off', this.turnOff.bind(this));

    this.createDefaultLevelControlClusterServer();
    this.addCommandHandler('moveToLevel', this.moveToLevel.bind(this));
    this.addCommandHandler('moveToLevelWithOnOff', this.moveToLevel.bind(this));

    this.createDefaultColorControlClusterServer();
    this.addCommandHandler('moveToHueAndSaturation', this.moveToHueAndSaturation.bind(this));
    this.addCommandHandler('moveToColorTemperature', this.moveToColorTemperature.bind(this));
  }

  private identify: MatterbridgeDeviceCommands['identify'] = async ({ request: { identifyTime } }) => {
    this.log.info(`Command identify called, identifyTime: ${identifyTime}`);
  };

  private turnOn: MatterbridgeDeviceCommands['on'] = async () => {
    this.getClusterServer(OnOffCluster)?.setOnOffAttribute(true);
  };

  private turnOff: MatterbridgeDeviceCommands['off'] = async () => {
    this.getClusterServer(OnOffCluster)?.setOnOffAttribute(false);
  };

  private moveToLevel: MatterbridgeDeviceCommands['moveToLevel'] = async ({
    request: { level },
    attributes: { currentLevel },
  }) => {
    this.getClusterServer(LevelControlCluster)?.setCurrentLevelAttribute(level);
    this.log.debug(`moveToLevel: ${level}, current level: ${currentLevel?.getLocal()}`);
  };

  private moveToHueAndSaturation: MatterbridgeDeviceCommands['moveToHueAndSaturation'] = async ({
    request: {
      hue,
      saturation,
    },
    attributes: {
      currentHue,
      currentSaturation,
    },
  }) => {
    this.getClusterServer(ColorControlCluster.with(MColorControl.Feature.HueSaturation))?.setCurrentHueAttribute(hue);
    this.getClusterServer(ColorControlCluster.with(MColorControl.Feature.HueSaturation))?.setCurrentSaturationAttribute(saturation);
    this.log.debug(`moveToHueAndSaturation: hue ${hue}, saturation ${saturation},`
      + `current: hue ${currentHue?.getLocal()}, saturation ${currentSaturation?.getLocal()}`);
  };

  private moveToColorTemperature: MatterbridgeDeviceCommands['moveToColorTemperature'] = async ({
    request: { colorTemperatureMireds },
    attributes: { colorTemperatureMireds: currentColorTemperatureMireds },
  }) => {
    this.getClusterServer(ColorControl.Complete)?.setColorTemperatureMiredsAttribute(colorTemperatureMireds);
    this.log.debug(`Command moveToColorTemperature called request: ${colorTemperatureMireds} attributes: ${currentColorTemperatureMireds?.getLocal()}`);
  };

}
