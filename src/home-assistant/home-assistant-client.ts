import globToRegExp from 'glob-to-regexp';
import {
  callService,
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  HassEntities,
  HassEntity,
  HassServiceTarget,
  subscribeEntities,
} from 'home-assistant-js-websocket';

export interface HomeAssistantClientConfig {
  readonly includeDomains?: Array<string>;
  readonly includePatterns?: Array<string>;
  readonly excludeDomains?: Array<string>;
  readonly excludePatterns?: Array<string>;
}

export class HomeAssistantClient {
  public static async create(
    url: string,
    accessToken: string,
    config?: HomeAssistantClientConfig,
  ): Promise<HomeAssistantClient> {
    url = url.replace(/\/$/, '');
    const auth = createLongLivedTokenAuth(url, accessToken);
    const connection = await createConnection({ auth });
    return new HomeAssistantClient(connection, config ?? {});
  }

  private readonly includeDomains: Array<string>;
  private readonly includePatterns: RegExp[];
  private readonly excludeDomains: Array<string>;
  private readonly excludePatterns: RegExp[];

  constructor(
    private readonly connection: Connection,
    config: HomeAssistantClientConfig,
  ) {
    this.includeDomains = (config.includeDomains ?? []).map((domain) => `${domain}.`);
    this.includePatterns = config.includePatterns?.map((pattern) => globToRegExp(pattern)) ?? [];
    this.excludeDomains = (config.excludeDomains ?? []).map((domain) => `${domain}.`);
    this.excludePatterns = config.excludePatterns?.map((pattern) => globToRegExp(pattern)) ?? [];
  }

  public subscribe(subscriber: (entities: HassEntities) => void): () => void {
    return subscribeEntities(this.connection, (entities) => {
      const filteredEntities = Object.entries(entities).filter(
        ([key, entity]) => this.isIncluded(key) && this.isEnabled(entity),
      );
      subscriber(Object.fromEntries(filteredEntities));
    });
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

  private isIncluded(entityId: string): boolean {
    const domainIncluded = this.includeDomains.some((domain) => entityId.startsWith(domain));
    const patternIncluded = this.includePatterns.some((pattern) => pattern.test(entityId));
    const included =
      this.includeDomains.length + this.includePatterns.length === 0 || domainIncluded || patternIncluded;
    const domainExcluded = this.excludeDomains.some((domain) => entityId.startsWith(domain));
    const patternExcluded = this.excludePatterns.some((pattern) => pattern.test(entityId));
    const excluded = domainExcluded || patternExcluded;
    return included && !excluded;
  }

  private isEnabled(entity: HassEntity): boolean {
    return !entity.attributes?.hidden;
  }
}
