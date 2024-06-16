import { Collection, Connection, getCollection, UnsubscribeFunc } from 'home-assistant-js-websocket';
import type { Store } from 'home-assistant-js-websocket/dist/store.js';

export interface HassRegistryEntity {
  entity_id: string;
  device_id?: string;
  disabled_by?: string;
  hidden_by?: string;
  options?: {
    conversation?: {
      should_expose?: boolean;
    };
  };
}

export type HassRegistryEntities = Record<string, HassRegistryEntity>;

export function subscribeEntityRegistry(
  connection: Connection,
  subscriber: (state: HassRegistryEntities) => void,
): UnsubscribeFunc {
  return entityRegistryColl(connection).subscribe(subscriber);
}

export function entityRegistryColl(connection: Connection): Collection<HassRegistryEntities> {
  return getCollection(connection, '_entity_registry', fetchEntityRegistry, subscribeUpdates);
}

async function fetchEntityRegistry(connection: Connection): Promise<HassRegistryEntities> {
  const entries = await connection.sendMessagePromise<HassRegistryEntity[]>({ type: 'config/entity_registry/list' });
  return Object.fromEntries(entries.map((e) => [e.entity_id, e]));
}

async function subscribeUpdates(connection: Connection, store: Store<HassRegistryEntities>): Promise<UnsubscribeFunc> {
  return connection.subscribeEvents(async () => {
    const registry = await fetchEntityRegistry(connection);
    store.action(reduceUpdate)(registry);
  }, 'entity_registry_updated');
}

function reduceUpdate(_: HassRegistryEntities, event: HassRegistryEntities): HassRegistryEntities {
  return event;
}
