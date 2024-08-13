import { ClusterServer, OnOffCluster } from '@project-chip/matter.js/cluster';
import type { ClusterServerHandlers, OnOff } from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { AspectBase } from './aspect-base.js';

import { HomeAssistantClient } from '../home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '../models/index.js';

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

type OnOffHandlers = Required<ClusterServerHandlers<typeof OnOff.Complete>>;

export class OnOffAspect extends AspectBase {
  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: Device,
    entity: HomeAssistantMatterEntity,
    private readonly config?: OnOffAspectConfig,
  ) {
    super('OnOffAspect', entity);

    device.addClusterServer(
      ClusterServer(
        OnOffCluster,
        { onOff: this.isOn(entity) },
        {
          on: this.turnOn.bind(this),
          off: this.turnOff.bind(this),
          toggle: this.toggle.bind(this),
        },
      ),
    );
  }

  private turnOn = async (): Promise<void> => {
    const cluster = this.device.getClusterServer(OnOffCluster)!;
    this.log.debug('FROM MATTER: changed on off state to ON', this.entityId);
    cluster!.setOnOffAttribute(true);
    const [domain, service] = this.config?.turnOn?.service?.split('.') ?? ['homeassistant', 'turn_on'];
    await this.homeAssistantClient.callService(domain, service, this.config?.turnOn?.data?.(true), {
      entity_id: this.entityId,
    });
  };

  private turnOff = async (): Promise<void> => {
    const cluster = this.device.getClusterServer(OnOffCluster)!;
    this.log.debug('FROM MATTER: %s changed on off state to OFF', this.entityId);
    cluster!.setOnOffAttribute(false);
    const [domain, service] = this.config?.turnOff?.service?.split('.') ?? ['homeassistant', 'turn_off'];
    await this.homeAssistantClient.callService(domain, service, this.config?.turnOn?.data?.(false), {
      entity_id: this.entityId,
    });
  };

  private toggle: OnOffHandlers['toggle'] = async (data) => {
    if (data.attributes.onOff.getLocal()) {
      await this.turnOff();
    } else {
      await this.turnOn();
    }
  };

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const cluster = this.device.getClusterServer(OnOffCluster)!;
    const isOn = this.isOn(state);
    if (cluster.getOnOffAttribute() !== isOn) {
      this.log.debug('FROM HA: %s changed on-off state to %s', state.entity_id, state.state);
      cluster.setOnOffAttribute(isOn);
    }
  }

  private isOn(state: HomeAssistantMatterEntity): boolean {
    const isOnFn = this.config?.isOn ?? ((entity: HomeAssistantMatterEntity) => entity.state !== 'off');
    return isOnFn(state);
  }
}
