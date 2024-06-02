import * as crypto from 'crypto';
import { HassEntity, HassServiceTarget } from 'home-assistant-js-websocket';
import { MatterbridgeDevice, DeviceTypeDefinition, EndpointOptions } from 'matterbridge';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';

export abstract class HomeAssistantDevice extends MatterbridgeDevice {

  public readonly entityId: string;

  protected constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    entity: HassEntity,
    definition: DeviceTypeDefinition, options?: EndpointOptions,
  ) {
    super(definition, options);

    this.entityId = entity.entity_id;

    this.createDefaultGroupsClusterServer();
    this.createDefaultScenesClusterServer();
    this.createDefaultBridgedDeviceBasicInformationClusterServer(
      entity.attributes.friendly_name ?? entity.entity_id,
      this.createSerial(entity.entity_id), 0x0000, 't0bst4r', definition.name,
    );
  }

  public abstract updateState(state: HassEntity): void | Promise<void>;

  protected callService(
    domain: string, service: string, serviceData?: object,
    target?: HassServiceTarget, returnResponse?: boolean,
  ): Promise<unknown> {
    return this.homeAssistantClient.callService(domain, service, serviceData, target, returnResponse);
  }

  private createSerial(entityId: string) {
    return crypto
      .createHash('md5')
      .update(entityId)
      .digest('hex')
      .substring(0, 30);
  }

}