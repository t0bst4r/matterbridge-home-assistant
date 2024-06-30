import { extendPublicHandlerMethods } from '@project-chip/matter.js/util';
import { Device, DeviceTypeDefinition, EndpointOptions } from '@project-chip/matter.js/device';
import { createDefaultGroupsClusterServer, createDefaultScenesClusterServer } from '@project-chip/matter.js/cluster';
import { Logger } from 'winston';
import { MatterAspect } from './aspects/matter-aspect.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { MatterbridgeDeviceCommands } from '../util/matterbrigde-device-commands.js';
import { logger } from '../logger.js';
import { BasicInformationAspect } from './aspects/basic-information-aspect.js';

const BaseDevice = extendPublicHandlerMethods<typeof Device, MatterbridgeDeviceCommands>(Device);

export abstract class HomeAssistantDevice extends BaseDevice {
  public readonly logger: Logger;
  public readonly entityId: string;
  private readonly aspects: MatterAspect<Entity>[] = [];

  protected constructor(entity: Entity, definition: DeviceTypeDefinition, options: EndpointOptions = {}) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const args: any[] = [definition, options];
    super(...args);

    this.logger = logger.child({ service: entity.entity_id });
    this.entityId = entity.entity_id;

    this.addClusterServer(createDefaultGroupsClusterServer());
    this.addClusterServer(createDefaultScenesClusterServer());
    this.addAspect(new BasicInformationAspect(this, entity));
  }

  public addAspect(aspect: MatterAspect<Entity>): void {
    this.aspects.push(aspect);
  }

  public async updateState(state: Entity): Promise<void> {
    for (const aspect of this.aspects) {
      await aspect.update(state);
    }
  }
}
