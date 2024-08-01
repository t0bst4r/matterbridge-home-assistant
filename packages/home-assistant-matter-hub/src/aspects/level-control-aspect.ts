import { ClusterServer, LevelControl, LevelControlCluster } from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { noopFn } from '@/aspects/utils/noop-fn.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

import { AspectBase } from './aspect-base.js';
import { MatterbridgeDeviceCommands } from './utils/index.js';

export interface LevenControlAspectConfig {
  getValue: (entity: HomeAssistantMatterEntity) => number | undefined;
  getMinValue?: (entity: HomeAssistantMatterEntity) => number | undefined;
  getMaxValue?: (entity: HomeAssistantMatterEntity) => number | undefined;
  moveToLevel: {
    service: string;
    data: (value: number) => object;
  };
}

export class LevelControlAspect extends AspectBase {
  private get levelControlCluster() {
    return this.device.getClusterServer(LevelControlCluster);
  }

  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: Device,
    entity: HomeAssistantMatterEntity,
    private readonly config: LevenControlAspectConfig,
  ) {
    super('LevelControlAspect', entity);
    device.addClusterServer(
      ClusterServer(
        LevelControlCluster.with(LevelControl.Feature.OnOff),
        {
          minLevel: config.getMinValue?.(entity),
          maxLevel: config.getMaxValue?.(entity),
          currentLevel: config.getValue(entity) ?? null,
          onLevel: 0,
          options: {
            executeIfOff: false,
            coupleColorTempToLevel: false,
          },
        },
        {
          moveToLevel: this.moveToLevel.bind(this),
          move: noopFn(this.log, 'move'),
          step: noopFn(this.log, 'step'),
          stop: noopFn(this.log, 'stop'),
          moveToLevelWithOnOff: this.moveToLevel.bind(this),
          moveWithOnOff: noopFn(this.log, 'moveWithOnOff'),
          stepWithOnOff: noopFn(this.log, 'stepWithOnOff'),
          stopWithOnOff: noopFn(this.log, 'stopWithOnOff'),
        },
      ),
    );
  }

  private moveToLevel: MatterbridgeDeviceCommands['moveToLevel'] = async ({ request: { level } }) => {
    this.log.debug('FROM MATTER: %s changed value to %s', this.entityId, level);
    this.levelControlCluster!.setCurrentLevelAttribute(level);
    const [domain, service] = this.config.moveToLevel.service.split('.');
    await this.homeAssistantClient.callService(domain, service, this.config.moveToLevel.data(level), {
      entity_id: this.entityId,
    });
  };

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const levelControlClusterServer = this.levelControlCluster!;

    const minLevel = this.config.getMinValue?.(state);
    if (minLevel != null && levelControlClusterServer.getMinLevelAttribute?.() !== minLevel) {
      this.log.debug('FROM HA: %s changed min-value to %s', this.entityId, minLevel);
      levelControlClusterServer.setMinLevelAttribute(minLevel);
    }
    const maxLevel = this.config.getMaxValue?.(state);
    if (maxLevel != null && levelControlClusterServer.getMaxLevelAttribute?.() !== maxLevel) {
      this.log.debug('FROM HA: %s changed max-value to %s', this.entityId, maxLevel);
      levelControlClusterServer.setMaxLevelAttribute(maxLevel);
    }

    const level = this.config.getValue(state);
    if (level != null && levelControlClusterServer.getCurrentLevelAttribute() !== level) {
      this.log.debug('FROM HA: %s changed value to %s', this.entityId, level);
      levelControlClusterServer.setCurrentLevelAttribute(level);
    }
  }
}
