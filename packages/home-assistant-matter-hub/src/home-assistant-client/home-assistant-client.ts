import debounce from 'debounce-promise';
import {
  callService,
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  getStates,
  HassServiceTarget,
} from 'home-assistant-js-websocket';

import { HomeAssistantEntities, HomeAssistantEntityRegistry, HomeAssistantMatterEntities } from '@/models/index.js';

import { buildState } from './api/build-state.js';
import { entityRegistryColl } from './api/entity-registry-collection.js';
import { entityStatesColl } from './api/entity-state-collection.js';
import { PatternMatcher, PatternMatcherConfig } from './util/pattern-matcher.js';

export interface HomeAssistantClientConfig {
  url: string;
  accessToken: string;
  matcher: PatternMatcherConfig;
}

export type SubscribeFn = (entities: HomeAssistantMatterEntities) => Promise<void>;
export type UnsubscribeFn = () => void;

export class HomeAssistantClient {
  public static async create(config: HomeAssistantClientConfig): Promise<HomeAssistantClient> {
    const url = config.url.replace(/\/$/, '');
    const auth = createLongLivedTokenAuth(url, config.accessToken);
    const connection = await createConnection({ auth });
    const client = new HomeAssistantClient(connection, config);
    await client.init();
    return client;
  }

  private readonly update: () => Promise<void>;
  private readonly patternMatcher: PatternMatcher;
  private readonly observedEntities: Set<string> = new Set();

  private entityStates: HomeAssistantEntities = {};
  private entityRegistry: HomeAssistantEntityRegistry = {};
  private entities: HomeAssistantMatterEntities = {};

  private readonly subscribers = new Set<SubscribeFn>();

  private constructor(
    private readonly connection: Connection,
    private readonly config: HomeAssistantClientConfig,
  ) {
    this.update = debounce(this.expensiveUpdate.bind(this), 100);
    this.patternMatcher = new PatternMatcher(this.config.matcher);
  }

  private async init(): Promise<void> {
    (await getStates(this.connection))
      .map((entity) => entity.entity_id)
      .filter((entityId) => this.patternMatcher.isIncluded(entityId))
      .forEach((entityId) => this.observedEntities.add(entityId));
    const entityIds = Array.from(this.observedEntities);

    const entityStates = entityStatesColl(this.connection, entityIds);
    await entityStates.refresh();
    this.entityStates = entityStates.state;
    const entityRegistry = entityRegistryColl(this.connection, entityIds);
    await entityRegistry.refresh();
    this.entityRegistry = entityRegistry.state;
    await this.update();
  }

  private async expensiveUpdate() {
    this.entities = buildState(this.entityStates, this.entityRegistry);
    for (const subscriber of this.subscribers) {
      await subscriber(this.entities);
    }
  }

  public subscribeEntities(subscriber: SubscribeFn): UnsubscribeFn {
    this.subscribers.add(subscriber);
    void subscriber(this.entities);
    return () => this.subscribers.delete(subscriber);
  }

  callService<T = unknown>(
    domain: string,
    service: string,
    serviceData?: object,
    target?: HassServiceTarget,
    returnResponse?: boolean,
  ): Promise<T> {
    return callService(this.connection, domain, service, serviceData, target, returnResponse) as Promise<T>;
  }
}
