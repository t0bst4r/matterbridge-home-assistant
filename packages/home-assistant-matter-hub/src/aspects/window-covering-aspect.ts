import { MatterbridgeDevice, WindowCoveringCluster, WindowCovering } from 'matterbridge';

import { AspectBase } from '@/aspects/aspect-base.js';
import { MatterbridgeDeviceCommands } from '@/aspects/utils/index.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

const MATTER_CLOSED = 100_00;
const MATTER_OPEN = 0;

export class WindowCoveringAspect extends AspectBase {
  constructor(
    private readonly client: HomeAssistantClient,
    entity: HomeAssistantMatterEntity,
    private readonly device: MatterbridgeDevice,
  ) {
    super('WindowCoveringAspect', entity);
    this.device.createDefaultWindowCoveringClusterServer(entity.attributes.current_position * 100);
    this.device.addCommandHandler('upOrOpen', this.upOrOpen.bind(this));
    this.device.addCommandHandler('downOrClose', this.downOrClose.bind(this));
    this.device.addCommandHandler('stopMotion', this.stopMotion.bind(this));
    this.device.addCommandHandler('goToLiftPercentage', this.goToLiftPercentage.bind(this));
  }

  get cluster() {
    return this.device.getClusterServer(
      WindowCoveringCluster.with(WindowCovering.Feature.Lift, WindowCovering.Feature.PositionAwareLift),
    )!;
  }

  private invert(percentage: number): number {
    return 100 - percentage;
  }

  private readonly upOrOpen: MatterbridgeDeviceCommands['upOrOpen'] = async () => {
    await this.client.callService('cover', 'open_cover', {}, { entity_id: this.entityId });
    this.cluster.setTargetPositionLiftPercent100thsAttribute(MATTER_OPEN);
    this.cluster.setOperationalStatusAttribute({
      global: WindowCovering.MovementStatus.Opening,
      lift: WindowCovering.MovementStatus.Opening,
      tilt: undefined,
    });
  };

  private readonly downOrClose: MatterbridgeDeviceCommands['downOrClose'] = async () => {
    await this.client.callService('cover', 'close_cover', {}, { entity_id: this.entityId });
    this.cluster.setTargetPositionLiftPercent100thsAttribute(MATTER_CLOSED);
    this.cluster.setOperationalStatusAttribute({
      global: WindowCovering.MovementStatus.Closing,
      lift: WindowCovering.MovementStatus.Closing,
      tilt: undefined,
    });
  };

  private readonly stopMotion: MatterbridgeDeviceCommands['stopMotion'] = async () => {
    await this.client.callService('cover', 'stop_cover', {}, { entity_id: this.entityId });
    this.cluster.setTargetPositionLiftPercent100thsAttribute(
      this.cluster.getCurrentPositionLiftPercent100thsAttribute(),
    );
    this.cluster.setOperationalStatusAttribute({
      global: WindowCovering.MovementStatus.Stopped,
      lift: WindowCovering.MovementStatus.Stopped,
      tilt: undefined,
    });
  };

  private readonly goToLiftPercentage: MatterbridgeDeviceCommands['goToLiftPercentage'] = async (value) => {
    this.cluster.setTargetPositionLiftPercent100thsAttribute(value.request.liftPercent100thsValue);
    await this.client.callService(
      'cover',
      'set_cover_position',
      {
        position: this.invert(value.request.liftPercent100thsValue / 100),
      },
      { entity_id: this.entityId },
    );
  };

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const cluster = this.cluster;

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
    if (
      position != null &&
      !isNaN(position) &&
      cluster.getCurrentPositionLiftPercent100thsAttribute() !== position * 100
    ) {
      cluster.setCurrentPositionLiftPercent100thsAttribute(this.invert(position) * 100);
    }
  }
}
