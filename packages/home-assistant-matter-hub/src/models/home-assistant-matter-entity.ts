import { HomeAssistantEntity } from './home-assistant-entity.js';

export interface HomeAssistantMatterEntity extends HomeAssistantEntity {
  hidden: boolean;
}

export type HomeAssistantMatterEntities = Record<string, HomeAssistantMatterEntity>;
