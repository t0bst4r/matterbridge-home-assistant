import { createDefaultIdentifyClusterServer } from '@project-chip/matter.js/cluster';
import type { ClusterServerHandlers, Identify } from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';

type IdentifyHandlers = Required<ClusterServerHandlers<typeof Identify.Complete>>;

export class IdentifyAspect extends AspectBase {
  constructor(device: Device, entity: HomeAssistantMatterEntity) {
    super('IdentifyAspect', entity);
    device.addClusterServer(
      createDefaultIdentifyClusterServer({
        identify: this.onIdentify.bind(this),
      }),
    );
  }

  private onIdentify: IdentifyHandlers['identify'] = () => {
    this.log.debug('Identify called for %s', this.entityId);
  };

  async update(): Promise<void> {}
}
