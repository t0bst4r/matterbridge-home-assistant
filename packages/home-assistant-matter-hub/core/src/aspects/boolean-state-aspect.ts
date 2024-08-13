import { BooleanStateCluster, ClusterServer } from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { AspectBase } from './aspect-base.js';

import { HomeAssistantMatterEntity } from '../models/index.js';

export interface BooleanStateAspectConfig {
  invert?: boolean;
}

export class BooleanStateAspect extends AspectBase {
  constructor(
    private readonly device: Device,
    entity: HomeAssistantMatterEntity,
    private readonly config?: BooleanStateAspectConfig,
  ) {
    super('BooleanStateAspect', entity);
    device.addClusterServer(
      ClusterServer(BooleanStateCluster, { stateValue: this.isOn(entity) }, {}, { stateChange: true }),
    );
  }

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const booleanStateClusterServer = this.device.getClusterServer(BooleanStateCluster)!;
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
