import { HomeAssistantEntity } from './home-assistant-entity.js';

export interface HomeAssistantMatterEntity extends HomeAssistantEntity {
  matter: {
    uniqueId: string;
    serialNumber: string;
    deviceName: string;
  };
  hidden: boolean;
  labels: string[];
  platform: string;
}

export type HomeAssistantMatterEntities = Record<string, HomeAssistantMatterEntity>;
