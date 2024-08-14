import { HomeAssistantEntity } from './home-assistant-entity.js';

export interface HomeAssistantMatterEntity extends HomeAssistantEntity {
  domain: string;
  matter: {
    uniqueId: string;
    serialNumber: string;
  };
  hidden: boolean;
  labels: string[];
  platform: string;
  attributes: HomeAssistantEntity['attributes'] & {
    friendly_name: string;
  };
}

export type HomeAssistantMatterEntities = Record<string, HomeAssistantMatterEntity>;
