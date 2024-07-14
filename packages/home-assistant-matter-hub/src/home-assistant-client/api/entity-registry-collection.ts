import { Collection, Connection, getCollection, UnsubscribeFunc } from 'home-assistant-js-websocket';
import type { Store } from 'home-assistant-js-websocket/dist/store.js';

import { HomeAssistantEntityRegistry, HomeAssistantEntityRegistryEntry } from '@/models/index.js';

export function entityRegistryColl(
  connection: Connection,
  entityIds?: string[],
): Collection<HomeAssistantEntityRegistry> {
  return getCollection(
    connection,
    '_entity_registry',
    (c) => fetchCollection(c, entityIds),
    (c, s) => subscribeUpdates(c, s, entityIds),
  );
}

async function fetchCollection(connection: Connection, entityIds?: string[]): Promise<HomeAssistantEntityRegistry> {
  const entries = await connection.sendMessagePromise<HomeAssistantEntityRegistryEntry[]>({
    type: 'config/entity_registry/list',
    entity_ids: entityIds,
  });
  return Object.fromEntries(entries.map((e) => [e.entity_id, e]));
}

async function subscribeUpdates(
  connection: Connection,
  store: Store<HomeAssistantEntityRegistry>,
  entityIds?: string[],
): Promise<UnsubscribeFunc> {
  return connection.subscribeEvents(async () => {
    const registry = await fetchCollection(connection, entityIds);
    store.action(reduceUpdate)(registry);
  }, 'entity_registry_updated');
}

function reduceUpdate(_: HomeAssistantEntityRegistry, event: HomeAssistantEntityRegistry): HomeAssistantEntityRegistry {
  return event;
}
