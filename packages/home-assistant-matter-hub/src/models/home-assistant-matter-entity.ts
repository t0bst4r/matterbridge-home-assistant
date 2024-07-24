import { HomeAssistantEntity } from './home-assistant-entity.js';

export interface HomeAssistantMatterEntity extends HomeAssistantEntity {
  hidden: boolean;
  labels: string[];
  platform: string;
}

export type HomeAssistantMatterEntities = Record<string, HomeAssistantMatterEntity>;
