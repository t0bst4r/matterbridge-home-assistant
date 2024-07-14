import { Collection, Connection, getCollection, UnsubscribeFunc } from 'home-assistant-js-websocket';
import type { Store } from 'home-assistant-js-websocket/dist/store.js';

import { HomeAssistantEntities, HomeAssistantEntity } from '@/models/index.js';

export function entityStatesColl(connection: Connection, entityIds?: string[]): Collection<HomeAssistantEntities> {
  return getCollection(
    connection,
    '_entity_state',
    (c) => fetchCollection(c, entityIds),
    (c, s) => subscribeUpdates(c, s, entityIds),
  );
}

async function fetchCollection(connection: Connection, entityIds?: string[]): Promise<HomeAssistantEntities> {
  const entries = await connection.sendMessagePromise<HomeAssistantEntity[]>({
    type: 'get_states',
    entity_ids: entityIds,
  });
  return Object.fromEntries(entries.map((e) => [e.entity_id, e]));
}

async function subscribeUpdates(
  connection: Connection,
  store: Store<HomeAssistantEntities>,
  entityIds?: string[],
): Promise<UnsubscribeFunc> {
  return connection.subscribeMessage(
    (entities) => {
      store.action(reduceUpdate)(entities);
    },
    {
      type: 'subscribe_entities',
      entity_ids: entityIds,
    },
  );
}

function reduceUpdate(_: HomeAssistantEntities, event: HomeAssistantEntities): HomeAssistantEntities {
  return event;
}
