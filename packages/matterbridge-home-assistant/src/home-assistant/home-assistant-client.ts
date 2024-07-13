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
    return new HomeAssistantClient(connection);
  }

  private readonly entityCollection: Collection<HassEntities>;
  private readonly registryCollection: Collection<HassRegistryEntities>;
  private states: HassEntities | undefined = undefined;
  private registry: HassRegistryEntities | undefined = undefined;
  private entities: Record<string, Entity> = {};
  private readonly subscribers = new Set<SubscribeFn>();
  private readonly update: () => Promise<void>;

  private _isInitialized: boolean = false;
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  private constructor(private readonly connection: Connection) {
    this.update = debounce(this.expensiveUpdate.bind(this), 100);
    this.entityCollection = entitiesColl(connection);
    this.registryCollection = entityRegistryColl(connection);

    this.entityCollection.subscribe(async (states) => {
      this.states = states;
      await this.update();
    });
    this.registryCollection.subscribe(async (registry) => {
      this.registry = registry;
      await this.update();
    });
  }

  public subscribe(subscriber: SubscribeFn): UnsubscribeFn {
    this.subscribers.add(subscriber);
    void subscriber(this.entities);
    return () => this.subscribers.delete(subscriber);
  }

  private async expensiveUpdate() {
    if (!this.states || !this.registry) {
      return;
    }
    this.entities = Object.fromEntries(
      Object.keys(this.states)
        .map<Entity>((entityId) => ({
          ...this.states![entityId],
          hidden: !!this.registry?.[entityId]?.hidden_by,
        }))
        .map((entity) => [entity.entity_id, entity]),
    );
    for (const subscriber of this.subscribers) {
      await subscriber(this.entities);
    }
    this._isInitialized = true;
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
