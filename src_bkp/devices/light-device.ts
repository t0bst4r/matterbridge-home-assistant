import { DeviceTypes, OnOffCluster, LevelControlCluster } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device';

export class LightDevice extends HomeAssistantDevice {

  constructor(name: string, entityId: string) {
    super(DeviceTypes.ON_OFF_LIGHT);
    this.createDefaultIdentifyClusterServer();
    this.createDefaultGroupsClusterServer();
    this.createDefaultScenesClusterServer();
    this.createDefaultBridgedDeviceBasicInformationClusterServer(name, this.createSerial(entityId), 0x0000, 't0bst4r', 'Light Device');
    this.createDefaultOnOffClusterServer();

    this.addCommandHandler('identify', this.identify.bind(this));
  }

  private async identify({ request: { identifyTime } }: any) {
    this.log.info(`Command identify called, identifyTime: ${identifyTime}`);
  }

  private async turnOn() {
    this.getClusterServer(OnOffCluster)?.setOnOffAttribute(true);
  }

  private async turnOff() {
    this.getClusterServer(OnOffCluster)?.setOnOffAttribute(false);
  }

  private async moveToLevel({
    request: { level },
    attributes: { currentLevel },
  }: any) {
    this.getClusterServer(LevelControlCluster)?.setCurrentLevelAttribute(level);
    this.log.debug(`Command moveToLevel called request: ${level} attributes: ${currentLevel?.getLocal()}`);
  }

}
