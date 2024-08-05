import { createHash } from 'node:crypto';

import {
  HomeAssistantEntities,
  HomeAssistantEntity,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityRegistryEntry,
  HomeAssistantMatterEntities,
  HomeAssistantMatterEntity,
} from '@/models/index.js';

export function buildState(
  entityIds: string[],
  states: HomeAssistantEntities,
  entityRegistry: HomeAssistantEntityRegistry,
): HomeAssistantMatterEntities {
  return Object.fromEntries(
    entityIds.map((entityId) => [entityId, combine(states[entityId], entityRegistry[entityId])]),
  );
}

function combine(state: HomeAssistantEntity, registry?: HomeAssistantEntityRegistryEntry): HomeAssistantMatterEntity {
  const uniqueId = createHash('md5').update(state.entity_id).digest('hex');
  return {
    ...state,
    matter: {
      deviceName: state.attributes.friendly_name ?? state.entity_id,
      uniqueId,
      serialNumber: uniqueId.substring(0, 30),
    },
    hidden: !!registry?.hidden_by,
    platform: registry?.platform ?? 'unknown',
    labels: registry?.labels ?? [],
  };
}
