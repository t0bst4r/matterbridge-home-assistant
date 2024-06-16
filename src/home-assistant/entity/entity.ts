import { HassEntity } from 'home-assistant-js-websocket';

export interface Entity extends HassEntity {
  hidden?: boolean;
}
