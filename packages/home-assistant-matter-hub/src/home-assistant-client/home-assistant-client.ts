import debounce from 'debounce-promise';
import {
  callService,
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  getStates,
  HassServiceTarget,
  UnsubscribeFunc,
} from 'home-assistant-js-websocket';

import { subscribeEntities } from '@/home-assistant-client/api/subscribe-entities.js';
import { logger } from '@/logging/index.js';
import { HomeAssistantEntities, HomeAssistantEntityRegistry, HomeAssistantMatterEntities } from '@/models/index.js';

import { buildState } from './api/build-state.js';
import { getRegistry } from './api/entity-registry-collection.js';
import { PatternMatcher, PatternMatcherConfig } from './util/pattern-matcher.js';

export interface HomeAssistantClientConfig {
  url: string;
  accessToken: string;
  matcher?: PatternMatcherConfig;
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

  private readonly log = logger.child({ service: 'HomeAssistantClient' });
  private readonly update = debounce(this.expensiveUpdate.bind(this), 100);
  private readonly patternMatcher: PatternMatcher;

  private entityStates: HomeAssistantEntities = {};
  private entityRegistry: HomeAssistantEntityRegistry = {};
  private entities: HomeAssistantMatterEntities = {};

  private readonly subscribers = new Set<SubscribeFn>();
  public close?: UnsubscribeFunc;

  private constructor(
    private readonly connection: Connection,
    private readonly config: HomeAssistantClientConfig,
  ) {
    this.patternMatcher = new PatternMatcher(this.config.matcher ?? {});
  }

  private async init(): Promise<void> {
    const entityIds: string[] = [];
    const entities = await getStates(this.connection);
    entities.forEach((entity) => entityIds.push(entity.entity_id));
    this.entityStates = Object.fromEntries(entities.map((e) => [e.entity_id, e]));
    this.log.debug('%s entities included', entityIds.length);

    this.entityRegistry = await getRegistry(this.connection);
    this.log.debug('Registry refreshed');

    this.entities = Object.fromEntries(
      Object.entries(buildState(entityIds, this.entityStates, this.entityRegistry)).filter(([, entity]) =>
        this.patternMatcher.isIncluded(entity),
      ),
    );
    this.log.debug('State updated');

    this.close = subscribeEntities(
      this.connection,
      async (entityStates) => {
        this.entityStates = entityStates;
        await this.update();
      },
      entityIds,
    );
  }

  private async expensiveUpdate() {
    this.entities = buildState(Object.keys(this.entities), this.entityStates, this.entityRegistry);
    for (const subscriber of this.subscribers) {
      await subscriber(this.entities);
    }
  }

  public async subscribeEntities(subscriber: SubscribeFn): Promise<UnsubscribeFn> {
    this.subscribers.add(subscriber);
    await subscriber(this.entities);
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
