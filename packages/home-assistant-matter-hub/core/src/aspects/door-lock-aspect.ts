import { ClusterServer, ClusterServerHandlers, DoorLock, DoorLockCluster } from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { AspectBase } from './aspect-base.js';

import { HomeAssistantClient } from '../home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '../models/index.js';

type DoorLockHandlers = Required<ClusterServerHandlers<typeof DoorLock.Complete>>;

export class DoorLockAspect extends AspectBase {
  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: Device,
    entity: HomeAssistantMatterEntity,
  ) {
    super('DoorLockAspect', entity);
    device.addClusterServer(
      ClusterServer(
        DoorLockCluster,
        {
          lockState: this.getMatterState(entity),
          lockType: DoorLock.LockType.Deadbolt,
          operatingMode: DoorLock.OperatingMode.Normal,
          actuatorEnabled: true,
          supportedOperatingModes: {
            noRemoteLockUnlock: false,
            normal: true,
            passage: false,
            privacy: false,
            vacation: false,
          },
        },
        {
          lockDoor: this.lock.bind(this),
          unlockDoor: this.unlock.bind(this),
        },
        {
          doorLockAlarm: true,
          lockOperation: true,
          lockOperationError: true,
        },
      ),
    );
  }

  private readonly lock: DoorLockHandlers['lockDoor'] = async () => {
    const cluster = this.device.getClusterServer(DoorLockCluster)!;
    this.log.debug('FROM MATTER: %s changed lock state to "locked"', this.entityId);
    cluster.setLockStateAttribute(DoorLock.LockState.Locked);
    const [domain, service] = ['lock', 'lock'];
    await this.homeAssistantClient.callService(domain, service, undefined, {
      entity_id: this.entityId,
    });
  };
  private readonly unlock: DoorLockHandlers['unlockDoor'] = async () => {
    const cluster = this.device.getClusterServer(DoorLockCluster)!;
    this.log.debug('FROM MATTER: %s changed lock state to "unlocked"', this.entityId);
    cluster.setLockStateAttribute(DoorLock.LockState.Unlocked);
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
    const cluster = this.device.getClusterServer(DoorLockCluster)!;
    const newState = this.getMatterState(state);
    if (cluster.getLockStateAttribute() !== newState) {
      this.log.debug('FROM HA: %s changed lock state to %s', state.entity_id, state.state);
      cluster.setLockStateAttribute(newState);
    }
  }

  private getMatterState(state: HomeAssistantMatterEntity) {
    return this.mapHAState[state.state] ?? DoorLock.LockState.NotFullyLocked;
  }
}
