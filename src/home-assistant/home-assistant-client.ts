import {
  callService,
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  HassServiceTarget,
  UnsubscribeFunc,
} from 'home-assistant-js-websocket';
import { EntityConsumer, EntityManager } from './entity/entity-manager.js';

export class HomeAssistantClient {
  public static async create(url: string, accessToken: string): Promise<HomeAssistantClient> {
    url = url.replace(/\/$/, '');
    const auth = createLongLivedTokenAuth(url, accessToken);
    const connection = await createConnection({ auth });
    return new HomeAssistantClient(connection);
  }

  constructor(private readonly connection: Connection) {}

  subscribe(consumer: EntityConsumer): UnsubscribeFunc {
    const manager = new EntityManager(this.connection, consumer);
    return manager.close;
  }

  callService(
    domain: string,
    service: string,
    serviceData?: object,
    target?: HassServiceTarget,
    returnResponse?: boolean,
  ): Promise<unknown> {
    return callService(this.connection, domain, service, serviceData, target, returnResponse);
  }
}
