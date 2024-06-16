import {
  callService,
  Collection,
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  entitiesColl,
  HassEntities,
  HassServiceTarget,
} from 'home-assistant-js-websocket';
import { Entity } from './entity/entity.js';
import { entityRegistryColl, HassRegistryEntities } from './entity/entity-registry-collection.js';
import debounce from 'debounce-promise';

export type SubscribeFn = (entities: Record<string, Entity>) => Promise<void>;
export type UnsubscribeFn = () => void;

export class HomeAssistantClient {
  public static async create(url: string, accessToken: string): Promise<HomeAssistantClient> {
    url = url.replace(/\/$/, '');
    const auth = createLongLivedTokenAuth(url, accessToken);
    const connection = await createConnection({ auth });
    const client = new HomeAssistantClient(connection);
    await client.init();
    return client;
  }

  private readonly entityCollection: Collection<HassEntities>;
  private readonly registryCollection: Collection<HassRegistryEntities>;
  private states!: HassEntities;
  private registry!: HassRegistryEntities;
  private entities: Record<string, Entity> = {};
  private readonly subscribers = new Set<SubscribeFn>();
  private readonly update: () => Promise<void>;

  private constructor(private readonly connection: Connection) {
    this.update = debounce(this.expensiveUpdate.bind(this), 100);
    this.entityCollection = entitiesColl(connection);
    this.registryCollection = entityRegistryColl(connection);
  }

  private async init() {
    await this.entityCollection.refresh();
    await this.registryCollection.refresh();
    this.states = this.entityCollection.state;
    this.registry = this.registryCollection.state;

    this.entityCollection.subscribe((states) => {
      this.states = states;
      this.update();
    });
    this.entityCollection.subscribe((registry) => {
      this.registry = registry;
      this.update();
    });
  }

  public subscribe(subscriber: SubscribeFn): UnsubscribeFn {
    this.subscribers.add(subscriber);
    void subscriber(this.entities);
    return () => this.subscribers.delete(subscriber);
  }

  private async expensiveUpdate() {
    this.entities = Object.fromEntries(
      Object.keys(this.states)
        .map<Entity>((entityId) => ({
          ...this.states[entityId],
          hidden: !!this.registry[entityId]?.hidden_by,
        }))
        .map((entity) => [entity.entity_id, entity]),
    );
    for (const subscriber of this.subscribers) {
      await subscriber(this.entities);
    }
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
