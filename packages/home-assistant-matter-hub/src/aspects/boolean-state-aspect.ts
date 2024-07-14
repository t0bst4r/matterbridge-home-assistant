import { BooleanStateCluster, MatterbridgeDevice } from 'matterbridge';

import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';

export interface BooleanStateAspectConfig {
  invert?: boolean;
}

export class BooleanStateAspect extends AspectBase {
  constructor(
    private readonly device: MatterbridgeDevice,
    entity: HomeAssistantMatterEntity,
    private readonly config?: BooleanStateAspectConfig,
  ) {
    super('BooleanStateAspect', entity);
    device.createDefaultBooleanStateClusterServer(this.isOn(entity));
  }

  private get booleanStateCluster() {
    return this.device.getClusterServer(BooleanStateCluster);
  }

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const booleanStateClusterServer = this.booleanStateCluster!;
    const isOn = this.isOn(state);
    if (booleanStateClusterServer.getStateValueAttribute() !== isOn) {
      this.log.debug('FROM HA: %s changed boolean state to %s', state.entity_id, state.state);
      booleanStateClusterServer.setStateValueAttribute(isOn);
    }
  }

  private isOn(entity: HomeAssistantMatterEntity): boolean {
    const isNotOff = entity.state !== 'off';
    if (this.config?.invert == true) {
      return !isNotOff;
    } else {
      return isNotOff;
    }
  }
}
