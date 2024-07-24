import {
  HomeAssistantEntities,
  HomeAssistantEntity,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityRegistryEntry,
  HomeAssistantMatterEntities,
  HomeAssistantMatterEntity,
} from '@/models/index.js';

export function buildState(
  states: HomeAssistantEntities,
  entityRegistry: HomeAssistantEntityRegistry,
): HomeAssistantMatterEntities {
  return Object.fromEntries(
    Object.entries(states).map(([entityId, state]) => [entityId, combine(state, entityRegistry[entityId])]),
  );
}

function combine(
  state: HomeAssistantEntity,
  registry: HomeAssistantEntityRegistryEntry | undefined,
): HomeAssistantMatterEntity {
  return {
    ...state,
    hidden: !!registry?.hidden_by,
  };
}
