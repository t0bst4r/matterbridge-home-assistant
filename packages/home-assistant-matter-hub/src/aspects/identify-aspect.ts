import { MatterbridgeDevice } from 'matterbridge';

import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';

export class IdentifyAspect extends AspectBase {
  constructor(device: MatterbridgeDevice, entity: HomeAssistantMatterEntity) {
    super('IdentifyAspect', entity);
    device.createDefaultIdentifyClusterServer();
    device.addCommandHandler('identify', this.onIdentify.bind(this));
  }

  private onIdentify() {
    this.log.debug('Identify called for %s', this.entityId);
  }

  async update(): Promise<void> {}
}
