import globToRegExp from 'glob-to-regexp';

import { logger } from '../../logging/index.js';
import { HomeAssistantMatterEntity } from '../../models/index.js';

export interface PatternMatcherConfig {
  readonly includeDomains?: string[];
  readonly excludeDomains?: string[];

  readonly includePatterns?: string[];
  readonly excludePatterns?: string[];

  readonly includePlatforms?: string[];
  readonly excludePlatforms?: string[];

  readonly includeLabels?: string[];
  readonly excludeLabels?: string[];
}

export class PatternMatcher {
  private readonly log = logger.child({ service: 'PatternMatcher' });

  private readonly includeDomains: string[];
  private readonly excludeDomains: string[];

  private readonly includePatterns: RegExp[];
  private readonly excludePatterns: RegExp[];

  private readonly includePlatforms: string[];
  private readonly excludePlatforms: string[];

  private readonly includeLabels: string[];
  private readonly excludeLabels: string[];

  constructor(config: PatternMatcherConfig) {
    this.includeDomains = (config.includeDomains ?? []).map((domain) => `${domain}.`);
    this.excludeDomains = (config.excludeDomains ?? []).map((domain) => `${domain}.`);

    this.includePatterns = config.includePatterns?.map((pattern) => globToRegExp(pattern)) ?? [];
    this.excludePatterns = config.excludePatterns?.map((pattern) => globToRegExp(pattern)) ?? [];

    this.includePlatforms = config.includePlatforms ?? [];
    this.excludePlatforms = config.excludePlatforms ?? [];

    this.includeLabels = config.includeLabels ?? [];
    this.excludeLabels = config.excludeLabels ?? [];
  }

  public isIncluded(entity: HomeAssistantMatterEntity): boolean {
    const included = this.checkIncluded(entity);
    const excluded = this.checkExcluded(entity);
    if (excluded) {
      this.log.debug('%s is excluded', entity.entity_id);
    } else if (!included) {
      this.log.debug('%s is not included', entity.entity_id);
    } else {
      this.log.debug('%s is included', entity.entity_id);
    }
    return included && !excluded;
  }

  private checkIncluded(entity: HomeAssistantMatterEntity): boolean {
    const domainIncluded = this.includeDomains.some((domain) => entity.entity_id.startsWith(domain));
    const patternIncluded = this.includePatterns.some((pattern) => pattern.test(entity.entity_id));
    const platformIncluded = this.includePlatforms.includes(entity.platform);
    const labelsIncluded = this.includeLabels.some((label) => entity.labels.includes(label));
    return (
      this.includeDomains.length +
        this.includePatterns.length +
        this.includePlatforms.length +
        this.includeLabels.length ===
        0 ||
      domainIncluded ||
      patternIncluded ||
      platformIncluded ||
      labelsIncluded
    );
  }

  private checkExcluded(entity: HomeAssistantMatterEntity) {
    const domainExcluded = this.excludeDomains.some((domain) => entity.entity_id.startsWith(domain));
    const patternExcluded = this.excludePatterns.some((pattern) => pattern.test(entity.entity_id));
    const platformExcluded = this.excludePlatforms.includes(entity.platform);
    const labelsExcluded = this.excludeLabels.some((label) => entity.labels.includes(label));
    return domainExcluded || patternExcluded || platformExcluded || labelsExcluded;
  }
}
