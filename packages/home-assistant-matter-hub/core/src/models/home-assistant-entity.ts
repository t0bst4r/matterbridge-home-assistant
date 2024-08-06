import type { HassEntity } from 'home-assistant-js-websocket';

export interface HomeAssistantEntity extends HassEntity {}

export type HomeAssistantEntities = Record<string, HomeAssistantEntity>;
