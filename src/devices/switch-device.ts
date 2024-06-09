import { HassEntity } from 'home-assistant-js-websocket';
import { DeviceTypes, OnOffCluster } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { MatterbridgeDeviceCommands } from '../util/matterbrigde-device-commands.js';

export class SwitchDevice extends HomeAssistantDevice {
  private readonly isOn: (state: HassEntity) => boolean;

  constructor(homeAssistantClient: HomeAssistantClient, entity: HassEntity, isOn?: (state: HassEntity) => boolean) {
    super(homeAssistantClient, entity, DeviceTypes.ON_OFF_PLUGIN_UNIT);

    this.isOn = isOn ?? ((state) => state.state !== 'off');

    this.createDefaultIdentifyClusterServer();
    this.addCommandHandler('identify', this.identify.bind(this));

    this.createDefaultOnOffClusterServer();
    this.addCommandHandler('on', this.turnOn.bind(this));
    this.addCommandHandler('off', this.turnOff.bind(this));
  }

  async updateState(state: HassEntity) {
    const onOffClusterServer = this.getClusterServer(OnOffCluster)!;
    if (onOffClusterServer.getOnOffAttribute() !== this.isOn(state)) {
      onOffClusterServer.setOnOffAttribute(this.isOn(state));
    }
  }

  private identify: MatterbridgeDeviceCommands['identify'] = async ({ request: { identifyTime } }) => {
    this.log.info(`Command identify called, identifyTime: ${identifyTime}`);
  };

  private turnOn: MatterbridgeDeviceCommands['on'] = async () => {
    this.getClusterServer(OnOffCluster)?.setOnOffAttribute(true);
    await this.callService('homeassistant', 'turn_on', {}, { entity_id: this.entityId });
  };

  private turnOff: MatterbridgeDeviceCommands['off'] = async () => {
    this.getClusterServer(OnOffCluster)?.setOnOffAttribute(false);
    await this.callService('homeassistant', 'turn_off', {}, { entity_id: this.entityId });
  };
}
