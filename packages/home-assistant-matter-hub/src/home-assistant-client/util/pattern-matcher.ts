import globToRegExp from 'glob-to-regexp';

import { logger } from '@/logging/index.js';

export interface PatternMatcherConfig {
  readonly includeDomains?: Array<string>;
  readonly includePatterns?: Array<string>;
  readonly excludeDomains?: Array<string>;
  readonly excludePatterns?: Array<string>;
}

export class PatternMatcher {
  private readonly log = logger.child({ service: 'PatternMatcher' });

  private readonly includeDomains: Array<string>;
  private readonly includePatterns: RegExp[];
  private readonly excludeDomains: Array<string>;
  private readonly excludePatterns: RegExp[];

  constructor(config: PatternMatcherConfig) {
    this.includeDomains = (config.includeDomains ?? []).map((domain) => `${domain}.`);
    this.includePatterns = config.includePatterns?.map((pattern) => globToRegExp(pattern)) ?? [];
    this.excludeDomains = (config.excludeDomains ?? []).map((domain) => `${domain}.`);
    this.excludePatterns = config.excludePatterns?.map((pattern) => globToRegExp(pattern)) ?? [];
  }

  public isIncluded(entityId: string): boolean {
    const domainIncluded = this.includeDomains.some((domain) => entityId.startsWith(domain));
    const patternIncluded = this.includePatterns.some((pattern) => pattern.test(entityId));
    const included =
      this.includeDomains.length + this.includePatterns.length === 0 || domainIncluded || patternIncluded;
    const domainExcluded = this.excludeDomains.some((domain) => entityId.startsWith(domain));
    const patternExcluded = this.excludePatterns.some((pattern) => pattern.test(entityId));
    const excluded = domainExcluded || patternExcluded;
    if (excluded) {
      this.log.debug('%s is excluded', entityId);
    } else if (!included) {
      this.log.debug('%s is not included', entityId);
    } else {
      this.log.debug('%s is included', entityId);
    }
    return included && !excluded;
  }
}
