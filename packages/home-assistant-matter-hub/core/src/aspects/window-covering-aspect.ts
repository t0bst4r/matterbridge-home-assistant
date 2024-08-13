import {
  ClusterServer,
  ClusterServerHandlers,
  WindowCovering,
  WindowCoveringCluster,
} from '@project-chip/matter.js/cluster';
import { Device } from '@project-chip/matter.js/device';

import { AspectBase } from './aspect-base.js';

import { HomeAssistantClient } from '../home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '../models/index.js';

type WindowCoveringHandlers = Required<ClusterServerHandlers<typeof WindowCovering.Complete>>;

const MATTER_CLOSED = 100_00;
const MATTER_OPEN = 0;

const FeaturedWindowCoveringCluster = WindowCoveringCluster.with(
  WindowCovering.Feature.Lift,
  WindowCovering.Feature.PositionAwareLift,
  WindowCovering.Feature.AbsolutePosition,
);

export interface WindowCoveringAspectConfig {
  lift?: {
    /** @default true */
    invertPercentage?: boolean;
    /** @default false */
    swapOpenAndClosePercentage?: boolean;
  };
}

export class WindowCoveringAspect extends AspectBase {
  constructor(
    private readonly client: HomeAssistantClient,
    entity: HomeAssistantMatterEntity,
    private readonly device: Device,
    private readonly config?: WindowCoveringAspectConfig,
  ) {
    super('WindowCoveringAspect', entity);

    const initialPercentage = this.convertLiftValue(entity.attributes.current_position);
    const initialValue = initialPercentage ? initialPercentage * 100 : null;
    this.device.addClusterServer(
      ClusterServer(
        FeaturedWindowCoveringCluster,
        {
          type: WindowCovering.WindowCoveringType.Rollershade,
          configStatus: {
            operational: true,
            onlineReserved: true,
            liftPositionAware: true,
            liftMovementReversed: false, // TODO: config?.lift?.invertPercentage ?? false,
          },
          targetPositionLiftPercent100ths: initialValue,
          currentPositionLiftPercent100ths: initialValue,
          installedOpenLimitLift: 0,
          installedClosedLimitLift: 10000,
          operationalStatus: {
            global: WindowCovering.MovementStatus.Stopped,
            lift: WindowCovering.MovementStatus.Stopped,
          },
          endProductType: WindowCovering.EndProductType.RollerShade,
          mode: {},
        },
        {
          upOrOpen: this.upOrOpen.bind(this),
          downOrClose: this.downOrClose.bind(this),
          stopMotion: this.stopMotion.bind(this),
          goToLiftPercentage: this.goToLiftPercentage.bind(this),
        },
      ),
    );
  }

  private convertLiftValue(percentage: number | undefined | null): number | null {
    if (percentage == null) {
      return null;
    }
    const invert = this.config?.lift?.invertPercentage ?? true;
    let result = percentage;
    if (invert) {
      result = 100 - result;
    }
    const swap = this.config?.lift?.swapOpenAndClosePercentage ?? false;
    if (swap) {
      if (result >= 99.95) {
        result = 0;
      } else if (result <= 0.05) {
        result = 100;
      }
    }
    return result;
  }

  private readonly upOrOpen: WindowCoveringHandlers['upOrOpen'] = async () => {
    const cluster = this.device.getClusterServer(FeaturedWindowCoveringCluster)!;
    this.log.debug('FROM MATTER: Open');
    await this.client.callService('cover', 'open_cover', {}, { entity_id: this.entityId });
    cluster.setTargetPositionLiftPercent100thsAttribute(MATTER_OPEN);
    cluster.setOperationalStatusAttribute({
      global: WindowCovering.MovementStatus.Opening,
      lift: WindowCovering.MovementStatus.Opening,
      tilt: undefined,
    });
  };

  private readonly downOrClose: WindowCoveringHandlers['downOrClose'] = async () => {
    const cluster = this.device.getClusterServer(FeaturedWindowCoveringCluster)!;
    this.log.debug('FROM MATTER: Close');
    await this.client.callService('cover', 'close_cover', {}, { entity_id: this.entityId });
    cluster.setTargetPositionLiftPercent100thsAttribute(MATTER_CLOSED);
    cluster.setOperationalStatusAttribute({
      global: WindowCovering.MovementStatus.Closing,
      lift: WindowCovering.MovementStatus.Closing,
      tilt: undefined,
    });
  };

  private readonly stopMotion: WindowCoveringHandlers['stopMotion'] = async () => {
    const cluster = this.device.getClusterServer(FeaturedWindowCoveringCluster)!;
    this.log.debug('FROM MATTER: Stop Motion');
    await this.client.callService('cover', 'stop_cover', {}, { entity_id: this.entityId });
    cluster.setTargetPositionLiftPercent100thsAttribute(cluster.getCurrentPositionLiftPercent100thsAttribute());
    cluster.setOperationalStatusAttribute({
      global: WindowCovering.MovementStatus.Stopped,
      lift: WindowCovering.MovementStatus.Stopped,
      tilt: undefined,
    });
  };

  private readonly goToLiftPercentage: WindowCoveringHandlers['goToLiftPercentage'] = async (value) => {
    const cluster = this.device.getClusterServer(FeaturedWindowCoveringCluster)!;
    const position = value.request.liftPercent100thsValue;
    const targetPosition = this.convertLiftValue(position / 100);
    this.log.debug('FROM MATTER: Go to Lift Percentage Matter: %s, HA: %s', position, targetPosition);
    cluster.setTargetPositionLiftPercent100thsAttribute(position);
    await this.client.callService(
      'cover',
      'set_cover_position',
      {
        position: targetPosition,
      },
      { entity_id: this.entityId },
    );
  };

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const cluster = this.device.getClusterServer(FeaturedWindowCoveringCluster)!;

    const movementStatus = cluster.getOperationalStatusAttribute().lift;
    if (
      (state.state === 'open' || state.state === 'closed') &&
      movementStatus !== WindowCovering.MovementStatus.Stopped
    ) {
      cluster.setOperationalStatusAttribute({
        global: WindowCovering.MovementStatus.Stopped,
        lift: WindowCovering.MovementStatus.Stopped,
      });
    } else if (state.state === 'opening' && movementStatus !== WindowCovering.MovementStatus.Opening) {
      cluster.setOperationalStatusAttribute({
        global: WindowCovering.MovementStatus.Opening,
        lift: WindowCovering.MovementStatus.Opening,
      });
    } else if (state.state === 'closing' && movementStatus !== WindowCovering.MovementStatus.Closing) {
      cluster.setOperationalStatusAttribute({
        global: WindowCovering.MovementStatus.Closing,
        lift: WindowCovering.MovementStatus.Closing,
      });
    }

    const position = state.attributes.current_position;
    const targetPercentage = this.convertLiftValue(position);
    const targetPosition = targetPercentage != null ? targetPercentage * 100 : null;
    if (
      targetPosition != null &&
      !isNaN(targetPosition) &&
      cluster.getCurrentPositionLiftPercent100thsAttribute() !== targetPosition
    ) {
      this.log.debug('FROM HA: Set position to HA: %s, Matter: %s', position, targetPosition);
      cluster.setCurrentPositionLiftPercent100thsAttribute(targetPosition);
    }
  }
}
