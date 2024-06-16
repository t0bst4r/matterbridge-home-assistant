import { MatterbridgeDevice, OnOffCluster } from 'matterbridge';
import { MatterbridgeDeviceCommands } from '../../util/matterbrigde-device-commands.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { HomeAssistantClient } from '../../home-assistant/home-assistant-client.js';
import { MatterAspect } from './matter-aspect.js';
import { HassEntity } from 'home-assistant-js-websocket';

export class OnOffAspect extends MatterAspect<Entity> {
  private readonly isOn: (state: Entity) => boolean;

  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: Entity,
    isOn?: (state: HassEntity) => boolean,
  ) {
    super(entity.entity_id);
    this.isOn = isOn ?? ((state) => state.state !== 'off');

    device.createDefaultOnOffClusterServer();
    device.addCommandHandler('on', this.turnOn.bind(this));
    device.addCommandHandler('off', this.turnOff.bind(this));
  }

  private get onOffCluster() {
    return this.device.getClusterServer(OnOffCluster);
  }

  private turnOn: MatterbridgeDeviceCommands['on'] = async () => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed on off state to ON`);
    this.onOffCluster!.setOnOffAttribute(true);
    await this.homeAssistantClient.callService('light', 'turn_on', {}, { entity_id: this.entityId });
  };

  private turnOff: MatterbridgeDeviceCommands['off'] = async () => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed on off state to OFF`);
    this.onOffCluster!.setOnOffAttribute(false);
    await this.homeAssistantClient.callService('light', 'turn_off', {}, { entity_id: this.entityId });
  };

  async update(state: Entity): Promise<void> {
    const onOffClusterServer = this.onOffCluster!;
    const isOn = this.isOn(state);
    if (onOffClusterServer.getOnOffAttribute() !== isOn) {
      this.log.debug(`FROM HA: ${state.entity_id} changed on-off state to ${state.state}`);
      onOffClusterServer.setOnOffAttribute(isOn);
    }
  }
}
