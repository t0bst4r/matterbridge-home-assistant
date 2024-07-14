import { MatterbridgeDevice, OnOffCluster } from 'matterbridge';

import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';
import { MatterbridgeDeviceCommands } from './utils/index.js';

export interface OnOffAspectConfig {
  isOn?: (state: HomeAssistantMatterEntity) => boolean;
  turnOn?: {
    service?: string;
    data?: (value: boolean) => object;
  };
  turnOff?: {
    service?: string;
    data?: (value: boolean) => object;
  };
}

export class OnOffAspect extends AspectBase {
  private readonly log = this.baseLogger.child({ aspect: 'OnOffAspect' });

  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: HomeAssistantMatterEntity,
    private readonly config?: OnOffAspectConfig,
  ) {
    super(entity);
    device.createDefaultOnOffClusterServer();
    device.addCommandHandler('on', this.turnOn.bind(this));
    device.addCommandHandler('off', this.turnOff.bind(this));
  }

  private get onOffCluster() {
    return this.device.getClusterServer(OnOffCluster);
  }

  private turnOn: MatterbridgeDeviceCommands['on'] = async () => {
    this.log.debug('FROM MATTER: changed on off state to ON', this.entityId);
    this.onOffCluster!.setOnOffAttribute(true);
    const [domain, service] = this.config?.turnOn?.service?.split('.') ?? ['homeassistant', 'turn_on'];
    await this.homeAssistantClient.callService(domain, service, this.config?.turnOn?.data?.(true), {
      entity_id: this.entityId,
    });
  };

  private turnOff: MatterbridgeDeviceCommands['off'] = async () => {
    this.log.debug('FROM MATTER: %s changed on off state to OFF', this.entityId);
    this.onOffCluster!.setOnOffAttribute(false);
    const [domain, service] = this.config?.turnOff?.service?.split('.') ?? ['homeassistant', 'turn_off'];
    await this.homeAssistantClient.callService(domain, service, this.config?.turnOn?.data?.(false), {
      entity_id: this.entityId,
    });
  };

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const onOffClusterServer = this.onOffCluster!;
    const isOnFn = this.config?.isOn ?? ((entity: HomeAssistantMatterEntity) => entity.state !== 'off');
    const isOn = isOnFn(state);
    if (onOffClusterServer.getOnOffAttribute() !== isOn) {
      this.log.debug('FROM HA: %s changed on-off state to %s', state.entity_id, state.state);
      onOffClusterServer.setOnOffAttribute(isOn);
    }
  }
}
