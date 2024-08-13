import { Connection } from 'home-assistant-js-websocket';

import { HomeAssistantEntityRegistry, HomeAssistantEntityRegistryEntry } from '../../models/index.js';

export async function getRegistry(connection: Connection): Promise<HomeAssistantEntityRegistry> {
  const entries = await connection.sendMessagePromise<HomeAssistantEntityRegistryEntry[]>({
    type: 'config/entity_registry/list',
  });
  return Object.fromEntries(entries.map((e) => [e.entity_id, e]));
}
