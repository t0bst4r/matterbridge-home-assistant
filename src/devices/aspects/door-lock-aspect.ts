import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { MatterbridgeDevice, DoorLockCluster, DoorLock } from 'matterbridge';
import { MatterbridgeDeviceCommands } from '../../util/matterbrigde-device-commands.js';
import { HomeAssistantClient } from '../../home-assistant/home-assistant-client.js';

export class DoorLockAspect extends MatterAspect<Entity> {
  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: Entity,
  ) {
    super(entity.entity_id);

    device.createDefaultDoorLockClusterServer();
    device.addCommandHandler('lockDoor', this.lock.bind(this));
    device.addCommandHandler('unlockDoor', this.unlock.bind(this));
  }

  private get lockCluster() {
    return this.device.getClusterServer(DoorLockCluster)!;
  }

  private readonly lock: MatterbridgeDeviceCommands['lockDoor'] = async () => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed lock state to "locked"`);
    this.lockCluster.setLockStateAttribute(DoorLock.LockState.Locked);
    const [domain, service] = ['lock', 'lock'];
    await this.homeAssistantClient.callService(domain, service, undefined, {
      entity_id: this.entityId,
    });
  };
  private readonly unlock: MatterbridgeDeviceCommands['unlockDoor'] = async () => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed lock state to "unlocked"`);
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

  async update(state: Entity): Promise<void> {
    const cluster = this.lockCluster;
    const newState = this.mapHAState[state.state] ?? DoorLock.LockState.NotFullyLocked;
    if (cluster.getLockStateAttribute() !== newState) {
      this.log.debug(`FROM HA: ${state.entity_id} changed lock state to ${state.state}`);
      cluster.setLockStateAttribute(newState);
    }
  }
}
