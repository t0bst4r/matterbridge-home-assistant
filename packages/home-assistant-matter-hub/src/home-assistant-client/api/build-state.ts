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
  return {
    ...state,
    hidden: !!registry?.hidden_by,
    platform: registry?.platform ?? 'unknown',
    labels: registry?.labels ?? [],
  };
}
