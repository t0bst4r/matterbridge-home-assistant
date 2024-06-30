import { MatterbridgeDevice, OnOffCluster } from 'matterbridge';
import { MatterbridgeDeviceCommands } from '../../util/matterbrigde-device-commands.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { HomeAssistantClient } from '../../home-assistant/home-assistant-client.js';
import { MatterAspect } from './matter-aspect.js';

export interface OnOffAspectConfig {
  isOn?: (state: Entity) => boolean;
  turnOn?: {
    service?: string;
    data?: (value: boolean) => object;
  };
  turnOff?: {
    service?: string;
    data?: (value: boolean) => object;
  };
}

export class OnOffAspect extends MatterAspect<Entity> {
  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: Entity,
    private readonly config?: OnOffAspectConfig,
  ) {
    super(entity.entity_id);
    this.log.setLogName('OnOffAspect');

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
    const [domain, service] = this.config?.turnOn?.service?.split('.') ?? ['homeassistant', 'turn_on'];
    await this.homeAssistantClient.callService(domain, service, this.config?.turnOn?.data?.(true), {
      entity_id: this.entityId,
    });
  };

  private turnOff: MatterbridgeDeviceCommands['off'] = async () => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed on off state to OFF`);
    this.onOffCluster!.setOnOffAttribute(false);
    const [domain, service] = this.config?.turnOff?.service?.split('.') ?? ['homeassistant', 'turn_off'];
    await this.homeAssistantClient.callService(domain, service, this.config?.turnOn?.data?.(false), {
      entity_id: this.entityId,
    });
  };

  async update(state: Entity): Promise<void> {
    const onOffClusterServer = this.onOffCluster!;
    const isOnFn = this.config?.isOn ?? ((entity: Entity) => entity.state !== 'off');
    const isOn = isOnFn(state);
    if (onOffClusterServer.getOnOffAttribute() !== isOn) {
      this.log.debug(`FROM HA: ${state.entity_id} changed on-off state to ${state.state}`);
      onOffClusterServer.setOnOffAttribute(isOn);
    }
  }
}
