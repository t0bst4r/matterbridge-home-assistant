import {
  ClusterServer,
  ClusterServerHandlers,
  LevelControl,
  LevelControlCluster,
} from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { AspectBase } from './aspect-base.js';
import { noopFn } from './utils/noop-fn.js';

import { HomeAssistantClient } from '../home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '../models/index.js';

type LevelControlHandlers = Required<ClusterServerHandlers<typeof LevelControl.Complete>>;

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

  private moveToLevel: LevelControlHandlers['moveToLevel'] = async ({ request: { level } }) => {
    this.log.debug('FROM MATTER: %s changed value to %s', this.entityId, level);
    const cluster = this.device.getClusterServer(LevelControlCluster)!;
    cluster.setCurrentLevelAttribute(level);
    const [domain, service] = this.config.moveToLevel.service.split('.');
    await this.homeAssistantClient.callService(domain, service, this.config.moveToLevel.data(level), {
      entity_id: this.entityId,
    });
  };

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const cluster = this.device.getClusterServer(LevelControlCluster)!;

    const minLevel = this.config.getMinValue?.(state);
    if (minLevel != null && cluster.getMinLevelAttribute?.() !== minLevel) {
      this.log.debug('FROM HA: %s changed min-value to %s', this.entityId, minLevel);
      cluster.setMinLevelAttribute(minLevel);
    }
    const maxLevel = this.config.getMaxValue?.(state);
    if (maxLevel != null && cluster.getMaxLevelAttribute?.() !== maxLevel) {
      this.log.debug('FROM HA: %s changed max-value to %s', this.entityId, maxLevel);
      cluster.setMaxLevelAttribute(maxLevel);
    }

    const level = this.config.getValue(state);
    if (level != null && cluster.getCurrentLevelAttribute() !== level) {
      this.log.debug('FROM HA: %s changed value to %s', this.entityId, level);
      cluster.setCurrentLevelAttribute(level);
    }
  }
}
