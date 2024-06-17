import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { HomeAssistantClient } from '../../home-assistant/home-assistant-client.js';
import { LevelControlCluster, MatterbridgeDevice } from 'matterbridge';
import { MatterbridgeDeviceCommands } from '../../util/matterbrigde-device-commands.js';

export interface LevenControlAspectConfig {
  getValue: (entity: Entity) => number | undefined;
  getMinValue?: (entity: Entity) => number | undefined;
  getMaxValue?: (entity: Entity) => number | undefined;
  moveToLevel: {
    service: string;
    data: (value: number) => object;
  };
}

export class LevelControlAspect extends MatterAspect<Entity> {
  private get levelControlCluster() {
    return this.device.getClusterServer(LevelControlCluster);
  }

  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: Entity,
    private readonly config: LevenControlAspectConfig,
  ) {
    super(entity.entity_id);
    this.log.setLogName('LevelControlAspect');
    this.log.debug(`Entity ${entity.entity_id} supports level control`);
    device.createDefaultLevelControlClusterServer();
    device.addCommandHandler('moveToLevel', this.moveToLevel.bind(this));
    device.addCommandHandler('moveToLevelWithOnOff', this.moveToLevel.bind(this));
  }

  private moveToLevel: MatterbridgeDeviceCommands['moveToLevel'] = async ({ request: { level } }) => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed value to ${level}`);
    this.levelControlCluster!.setCurrentLevelAttribute(level);
    const [domain, service] = this.config.moveToLevel.service.split('.');
    await this.homeAssistantClient.callService(domain, service, this.config.moveToLevel.data(level), {
      entity_id: this.entityId,
    });
  };

  async update(state: Entity): Promise<void> {
    const levelControlClusterServer = this.levelControlCluster!;

    const minLevel = this.config.getMinValue?.(state);
    if (minLevel != null && levelControlClusterServer.getMinLevelAttribute?.() !== minLevel) {
      this.log.debug(`FROM HA: ${this.entityId} changed min-value to ${minLevel}`);
      levelControlClusterServer.setMinLevelAttribute(minLevel);
    }
    const maxLevel = this.config.getMaxValue?.(state);
    if (maxLevel != null && levelControlClusterServer.getMaxLevelAttribute?.() !== maxLevel) {
      this.log.debug(`FROM HA: ${this.entityId} changed max-value to ${maxLevel}`);
      levelControlClusterServer.setMaxLevelAttribute(maxLevel);
    }

    const level = this.config.getValue(state);
    if (level != null && levelControlClusterServer.getCurrentLevelAttribute() !== level) {
      this.log.debug(`FROM HA: ${this.entityId} changed value to ${level}`);
      levelControlClusterServer.setCurrentLevelAttribute(level);
    }
  }
}
