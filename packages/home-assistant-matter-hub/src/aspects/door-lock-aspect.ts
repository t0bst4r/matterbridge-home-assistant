import { DoorLock, DoorLockCluster, MatterbridgeDevice } from 'matterbridge';

import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';
import { MatterbridgeDeviceCommands } from './utils/index.js';

export class DoorLockAspect extends AspectBase {
  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: HomeAssistantMatterEntity,
  ) {
    super('DoorLockAspect', entity);
    device.createDefaultDoorLockClusterServer();
    device.addCommandHandler('lockDoor', this.lock.bind(this));
    device.addCommandHandler('unlockDoor', this.unlock.bind(this));
  }

  private get lockCluster() {
    return this.device.getClusterServer(DoorLockCluster)!;
  }

  private readonly lock: MatterbridgeDeviceCommands['lockDoor'] = async () => {
    this.log.debug('FROM MATTER: %s changed lock state to "locked"', this.entityId);
    this.lockCluster.setLockStateAttribute(DoorLock.LockState.Locked);
    const [domain, service] = ['lock', 'lock'];
    await this.homeAssistantClient.callService(domain, service, undefined, {
      entity_id: this.entityId,
    });
  };
  private readonly unlock: MatterbridgeDeviceCommands['unlockDoor'] = async () => {
    this.log.debug('FROM MATTER: %s changed lock state to "unlocked"', this.entityId);
    this.lockCluster.setLockStateAttribute(DoorLock.LockState.Unlocked);
    const [domain, service] = ['lock', 'unlock'];
    await this.homeAssistantClient.callService(domain, service, undefined, {
      entity_id: this.entityId,
    });
  };

  private readonly mapHAState: Record<string, DoorLock.LockState> = {
    locked: DoorLock.LockState.Locked,
    locking: DoorLock.LockState.Locked,
    unlocked: DoorLock.LockState.Unlocked,
    unlocking: DoorLock.LockState.Unlocked,
  };

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const cluster = this.lockCluster;
    const newState = this.mapHAState[state.state] ?? DoorLock.LockState.NotFullyLocked;
    if (cluster.getLockStateAttribute() !== newState) {
      this.log.debug('FROM HA: %s changed lock state to %s', state.entity_id, state.state);
      cluster.setLockStateAttribute(newState);
    }
  }
}
